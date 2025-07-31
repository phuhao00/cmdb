package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AIService provides AI-powered query and analysis capabilities
type AIService struct {
	assetService    *AssetService
	workflowService *WorkflowService
	userRepo        repository.UserRepository
	zhipuService    *ZhipuService
}

// NewAIService creates a new AI service
func NewAIService(assetService *AssetService, workflowService *WorkflowService, userRepo repository.UserRepository) *AIService {
	return &AIService{
		assetService:    assetService,
		workflowService: workflowService,
		userRepo:        userRepo,
		zhipuService:    NewZhipuService(),
	}
}

// QueryIntent represents different types of user queries
type QueryIntent string

const (
	QueryAssets       QueryIntent = "query_assets"
	QueryWorkflows    QueryIntent = "query_workflows"
	QueryStats        QueryIntent = "query_stats"
	QueryHelp         QueryIntent = "query_help"
	QueryUnknown      QueryIntent = "query_unknown"
	QueryAssetDetails QueryIntent = "query_asset_details"
	QueryUserInfo     QueryIntent = "query_user_info"
	QuerySystemStatus QueryIntent = "query_system_status"
)

// AIResponse represents the response from AI service
type AIResponse struct {
	Message     string      `json:"message"`
	Intent      QueryIntent `json:"intent"`
	Data        interface{} `json:"data,omitempty"`
	Suggestions []string    `json:"suggestions,omitempty"`
}

// ProcessQuery processes a natural language query and returns an AI response
func (s *AIService) ProcessQuery(ctx context.Context, userID string, query string, language string, userPermissions []model.Permission) (*AIResponse, error) {
	// First, try to get AI response using Zhipu AI
	zhipuRequest := ChatRequest{
		Message:  query,
		Language: language,
	}

	zhipuResponse, err := s.zhipuService.Chat(zhipuRequest)
	if err != nil {
		// Fallback to rule-based system if Zhipu AI fails
		return s.handleWithRules(ctx, userID, query, language, userPermissions)
	}

	// Check if the query requires specific data from our system
	intent := s.analyzeIntent(query)

	// For data-specific queries, get the data and enhance the AI response
	switch intent {
	case QueryAssets:
		dataResponse, dataErr := s.handleAssetQuery(ctx, query, userPermissions)
		if dataErr == nil && dataResponse.Data != nil {
			// Combine AI response with actual data
			return s.combineAIWithData(zhipuResponse, dataResponse, language), nil
		}
	case QueryWorkflows:
		dataResponse, dataErr := s.handleWorkflowQuery(ctx, query, userID, userPermissions)
		if dataErr == nil && dataResponse.Data != nil {
			return s.combineAIWithData(zhipuResponse, dataResponse, language), nil
		}
	case QueryStats:
		dataResponse, dataErr := s.handleStatsQuery(ctx, userPermissions)
		if dataErr == nil && dataResponse.Data != nil {
			return s.combineAIWithData(zhipuResponse, dataResponse, language), nil
		}
	case QueryAssetDetails:
		dataResponse, dataErr := s.handleAssetDetailsQuery(ctx, query, userPermissions)
		if dataErr == nil && dataResponse.Data != nil {
			return s.combineAIWithData(zhipuResponse, dataResponse, language), nil
		}
	case QueryUserInfo:
		dataResponse, dataErr := s.handleUserInfoQuery(ctx, userID)
		if dataErr == nil && dataResponse.Data != nil {
			return s.combineAIWithData(zhipuResponse, dataResponse, language), nil
		}
	case QuerySystemStatus:
		dataResponse, dataErr := s.handleSystemStatusQuery(ctx, userPermissions)
		if dataErr == nil && dataResponse.Data != nil {
			return s.combineAIWithData(zhipuResponse, dataResponse, language), nil
		}
	}

	// For general queries, return enhanced AI response
	return &AIResponse{
		Message:     zhipuResponse.Response,
		Intent:      intent,
		Suggestions: zhipuResponse.Suggestions,
	}, nil
}

// analyzeIntent analyzes the user's query to determine the intent
func (s *AIService) analyzeIntent(query string) QueryIntent {
	query = strings.ToLower(strings.TrimSpace(query))

	// Asset-related queries
	assetKeywords := []string{"资产", "设备", "服务器", "asset", "server", "device", "equipment"}
	workflowKeywords := []string{"工作流", "审批", "workflow", "approval", "pending"}
	statsKeywords := []string{"统计", "数量", "总计", "stats", "count", "total", "summary"}
	helpKeywords := []string{"帮助", "help", "如何", "怎么", "what can", "commands"}
	detailsKeywords := []string{"详情", "详细", "信息", "details", "info", "show me"}
	userKeywords := []string{"我的", "用户", "个人", "my", "user", "profile"}
	statusKeywords := []string{"状态", "健康", "系统", "status", "health", "system"}

	// Check for specific asset details query
	if s.containsAny(query, detailsKeywords) && s.containsAny(query, assetKeywords) {
		return QueryAssetDetails
	}

	// Check for user info query
	if s.containsAny(query, userKeywords) {
		return QueryUserInfo
	}

	// Check for system status query
	if s.containsAny(query, statusKeywords) {
		return QuerySystemStatus
	}

	// Check for help query
	if s.containsAny(query, helpKeywords) {
		return QueryHelp
	}

	// Check for stats query
	if s.containsAny(query, statsKeywords) {
		return QueryStats
	}

	// Check for workflow query
	if s.containsAny(query, workflowKeywords) {
		return QueryWorkflows
	}

	// Check for asset query
	if s.containsAny(query, assetKeywords) {
		return QueryAssets
	}

	return QueryUnknown
}

// containsAny checks if the query contains any of the keywords
func (s *AIService) containsAny(query string, keywords []string) bool {
	for _, keyword := range keywords {
		if strings.Contains(query, keyword) {
			return true
		}
	}
	return false
}

// handleAssetQuery handles asset-related queries
func (s *AIService) handleAssetQuery(ctx context.Context, query string, permissions []model.Permission) (*AIResponse, error) {
	// Check permissions
	if !s.hasPermission(permissions, "assets", "read") {
		return &AIResponse{
			Message: "抱歉，您没有查看资产信息的权限。",
			Intent:  QueryAssets,
		}, nil
	}

	// Extract filters from query
	filter := s.extractAssetFilters(query)

	// Get assets
	assets, err := s.assetService.GetAssets(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Generate response
	if len(assets) == 0 {
		return &AIResponse{
			Message: "根据您的查询条件，没有找到匹配的资产。",
			Intent:  QueryAssets,
			Suggestions: []string{
				"查看所有资产",
				"查看服务器资产",
				"查看在线资产",
			},
		}, nil
	}

	message := s.formatAssetResponse(assets, filter)

	return &AIResponse{
		Message: message,
		Intent:  QueryAssets,
		Data:    assets[:min(len(assets), 10)], // Limit to 10 results
		Suggestions: []string{
			"查看资产详情",
			"查看资产统计",
			"查看维护中的资产",
		},
	}, nil
}

// handleWorkflowQuery handles workflow-related queries
func (s *AIService) handleWorkflowQuery(ctx context.Context, query string, userID string, permissions []model.Permission) (*AIResponse, error) {
	// Check permissions
	if !s.hasPermission(permissions, "workflows", "read") {
		return &AIResponse{
			Message: "抱歉，您没有查看工作流信息的权限。",
			Intent:  QueryWorkflows,
		}, nil
	}

	var workflows []*model.Workflow
	var err error
	var message string

	if strings.Contains(strings.ToLower(query), "待审批") || strings.Contains(strings.ToLower(query), "pending") {
		workflows, err = s.workflowService.GetPendingWorkflows(ctx)
		message = fmt.Sprintf("当前有 %d 个待审批的工作流", len(workflows))
	} else if strings.Contains(strings.ToLower(query), "我的") || strings.Contains(strings.ToLower(query), "my") {
		workflows, err = s.workflowService.GetUserWorkflows(ctx, userID)
		message = fmt.Sprintf("您有 %d 个工作流记录", len(workflows))
	} else {
		filter := map[string]interface{}{}
		workflows, err = s.workflowService.GetWorkflows(ctx, filter)
		message = fmt.Sprintf("系统中共有 %d 个工作流", len(workflows))
	}

	if err != nil {
		return nil, err
	}

	if len(workflows) > 0 {
		message += s.formatWorkflowSummary(workflows)
	}

	return &AIResponse{
		Message: message,
		Intent:  QueryWorkflows,
		Data:    workflows[:min(len(workflows), 5)], // Limit to 5 results
		Suggestions: []string{
			"查看待审批工作流",
			"查看我的工作流",
			"查看工作流统计",
		},
	}, nil
}

// handleStatsQuery handles statistics queries
func (s *AIService) handleStatsQuery(ctx context.Context, permissions []model.Permission) (*AIResponse, error) {
	stats := make(map[string]interface{})
	message := "📊 系统统计信息：\n\n"

	// Asset stats
	if s.hasPermission(permissions, "assets", "read") {
		assetStats, err := s.assetService.GetAssetStats(ctx)
		if err == nil {
			stats["assets"] = assetStats
			message += fmt.Sprintf("🖥️ 资产统计：\n")
			for status, count := range assetStats {
				message += fmt.Sprintf("  • %s: %d\n", s.translateStatus(status), count)
			}
			message += "\n"
		}
	}

	// Workflow stats
	if s.hasPermission(permissions, "workflows", "read") {
		workflowStats, err := s.workflowService.GetWorkflowStats(ctx)
		if err == nil {
			stats["workflows"] = workflowStats
			message += fmt.Sprintf("⚡ 工作流统计：\n")
			for status, count := range workflowStats {
				message += fmt.Sprintf("  • %s: %d\n", s.translateWorkflowStatus(status), count)
			}
		}
	}

	return &AIResponse{
		Message: message,
		Intent:  QueryStats,
		Data:    stats,
		Suggestions: []string{
			"查看资产类型分布",
			"查看最近的工作流",
			"查看系统健康状况",
		},
	}, nil
}

// handleAssetDetailsQuery handles detailed asset information queries
func (s *AIService) handleAssetDetailsQuery(ctx context.Context, query string, permissions []model.Permission) (*AIResponse, error) {
	// Check permissions
	if !s.hasPermission(permissions, "assets", "read") {
		return &AIResponse{
			Message: "抱歉，您没有查看资产详情的权限。",
			Intent:  QueryAssetDetails,
		}, nil
	}

	// Extract asset identifier from query
	assetID := s.extractAssetID(query)
	if assetID == "" {
		return &AIResponse{
			Message: "请提供具体的资产ID或名称，例如：'查看资产SRV-001的详情'",
			Intent:  QueryAssetDetails,
			Suggestions: []string{
				"查看所有资产",
				"查看服务器资产",
			},
		}, nil
	}

	// Try to find asset by ID first, then by name
	filter := map[string]interface{}{
		"search": assetID,
	}

	assets, err := s.assetService.GetAssets(ctx, filter)
	if err != nil {
		return nil, err
	}

	if len(assets) == 0 {
		return &AIResponse{
			Message: fmt.Sprintf("未找到资产'%s'，请检查资产ID或名称是否正确。", assetID),
			Intent:  QueryAssetDetails,
		}, nil
	}

	asset := assets[0]
	message := fmt.Sprintf("🖥️ 资产详情：%s\n\n", asset.Name)
	message += fmt.Sprintf("📋 基本信息：\n")
	message += fmt.Sprintf("  • ID: %s\n", asset.AssetID)
	message += fmt.Sprintf("  • 类型: %s\n", asset.Type)
	message += fmt.Sprintf("  • 状态: %s\n", s.translateAssetStatus(string(asset.Status)))
	message += fmt.Sprintf("  • 位置: %s\n", asset.Location)
	message += fmt.Sprintf("  • 描述: %s\n", asset.Description)
	message += fmt.Sprintf("  • 创建时间: %s\n", asset.CreatedAt.Format("2006-01-02 15:04:05"))

	return &AIResponse{
		Message: message,
		Intent:  QueryAssetDetails,
		Data:    asset,
		Suggestions: []string{
			"查看该资产的工作流历史",
			"查看相同类型的其他资产",
		},
	}, nil
}

// handleUserInfoQuery handles user information queries
func (s *AIService) handleUserInfoQuery(ctx context.Context, userID string) (*AIResponse, error) {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return &AIResponse{
			Message: "无效的用户ID格式。",
			Intent:  QueryUserInfo,
		}, nil
	}

	user, err := s.userRepo.GetByID(ctx, objectID)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return &AIResponse{
			Message: "无法获取用户信息。",
			Intent:  QueryUserInfo,
		}, nil
	}

	message := fmt.Sprintf("👤 用户信息：\n\n")
	message += fmt.Sprintf("  • 用户名: %s\n", user.Username)
	message += fmt.Sprintf("  • 姓名: %s\n", user.FullName)
	message += fmt.Sprintf("  • 角色: %s\n", s.translateRole(string(user.Role)))
	message += fmt.Sprintf("  • 状态: %s\n", s.translateUserStatus(string(user.Status)))
	if user.LastLoginAt != nil {
		message += fmt.Sprintf("  • 最后登录: %s\n", user.LastLoginAt.Format("2006-01-02 15:04:05"))
	}

	return &AIResponse{
		Message: message,
		Intent:  QueryUserInfo,
		Data:    user,
		Suggestions: []string{
			"查看我的工作流",
			"查看我的权限",
		},
	}, nil
}

// handleSystemStatusQuery handles system status queries
func (s *AIService) handleSystemStatusQuery(ctx context.Context, permissions []model.Permission) (*AIResponse, error) {
	message := "🔧 系统状态：\n\n"

	if s.hasPermission(permissions, "assets", "read") {
		assetStats, _ := s.assetService.GetAssetStats(ctx)
		if assetStats != nil {
			total := int64(0)
			online := int64(0)
			for status, count := range assetStats {
				total += count
				if status == "online" {
					online = count
				}
			}
			healthPercentage := float64(online) / float64(total) * 100
			message += fmt.Sprintf("💚 资产健康度: %.1f%% (%d/%d 在线)\n", healthPercentage, online, total)
		}
	}

	if s.hasPermission(permissions, "workflows", "read") {
		workflowStats, _ := s.workflowService.GetWorkflowStats(ctx)
		if workflowStats != nil {
			pending := workflowStats["pending"]
			message += fmt.Sprintf("⏳ 待处理工作流: %d 个\n", pending)
		}
	}

	message += fmt.Sprintf("🕐 系统时间: %s\n", time.Now().Format("2006-01-02 15:04:05"))
	message += "✅ 系统运行正常"

	return &AIResponse{
		Message: message,
		Intent:  QuerySystemStatus,
		Suggestions: []string{
			"查看详细统计",
			"查看待审批工作流",
		},
	}, nil
}

// handleHelpQuery handles help queries
func (s *AIService) handleHelpQuery() *AIResponse {
	message := "🤖 AI助手使用指南：\n\n"
	message += "我可以帮助您：\n"
	message += "📊 查询资产信息 - '显示所有服务器' '查看在线资产'\n"
	message += "⚡ 查看工作流 - '我的工作流' '待审批的工作流'\n"
	message += "📈 获取统计数据 - '系统统计' '资产数量'\n"
	message += "🔍 查看详细信息 - '资产SRV-001详情'\n"
	message += "👤 用户信息 - '我的信息' '个人资料'\n"
	message += "🔧 系统状态 - '系统健康状况' '服务状态'\n\n"
	message += "💡 提示：使用自然语言描述您的需求即可！"

	return &AIResponse{
		Message: message,
		Intent:  QueryHelp,
		Suggestions: []string{
			"查看所有资产",
			"我的工作流",
			"系统统计",
			"系统状态",
		},
	}
}

// handleUnknownQuery handles unknown queries
func (s *AIService) handleUnknownQuery(query string) *AIResponse {
	return &AIResponse{
		Message: fmt.Sprintf("🤔 我还不太理解您的问题：'%s'\n\n请尝试使用更明确的表达，比如：\n• '查看所有资产'\n• '我的工作流'\n• '系统统计'\n• '帮助'", query),
		Intent:  QueryUnknown,
		Suggestions: []string{
			"帮助",
			"查看资产",
			"我的工作流",
			"系统统计",
		},
	}
}

// Helper functions

func (s *AIService) extractAssetFilters(query string) map[string]interface{} {
	filter := make(map[string]interface{})
	query = strings.ToLower(query)

	// Status filters
	if strings.Contains(query, "在线") || strings.Contains(query, "online") {
		filter["status"] = "online"
	} else if strings.Contains(query, "离线") || strings.Contains(query, "offline") {
		filter["status"] = "offline"
	} else if strings.Contains(query, "维护") || strings.Contains(query, "maintenance") {
		filter["status"] = "maintenance"
	}

	// Type filters
	if strings.Contains(query, "服务器") || strings.Contains(query, "server") {
		filter["type"] = "Server"
	} else if strings.Contains(query, "网络") || strings.Contains(query, "network") {
		filter["type"] = "Network"
	} else if strings.Contains(query, "存储") || strings.Contains(query, "storage") {
		filter["type"] = "Storage"
	}

	return filter
}

func (s *AIService) extractAssetID(query string) string {
	// Extract asset ID patterns like SRV-001, NET-002, etc.
	re := regexp.MustCompile(`[A-Z]{3}-\d{3}`)
	matches := re.FindString(strings.ToUpper(query))
	if matches != "" {
		return matches
	}

	// Try to extract quoted asset names
	re = regexp.MustCompile(`['"]([^'"]+)['"]`)
	submatchResult := re.FindStringSubmatch(query)
	if len(submatchResult) > 1 {
		return submatchResult[1]
	}

	return ""
}

func (s *AIService) formatAssetResponse(assets []*model.Asset, filter map[string]interface{}) string {
	message := fmt.Sprintf("🖥️ 找到 %d 个资产：\n\n", len(assets))

	for i, asset := range assets {
		if i >= 5 { // Limit to 5 items in summary
			message += fmt.Sprintf("... 还有 %d 个资产\n", len(assets)-5)
			break
		}
		message += fmt.Sprintf("• %s (%s) - %s - %s\n",
			asset.Name,
			asset.AssetID,
			s.translateAssetStatus(string(asset.Status)),
			asset.Location)
	}

	return message
}

func (s *AIService) formatWorkflowSummary(workflows []*model.Workflow) string {
	statusCount := make(map[string]int)
	for _, w := range workflows {
		statusCount[string(w.Status)]++
	}

	message := "\n📋 状态分布：\n"
	for status, count := range statusCount {
		message += fmt.Sprintf("  • %s: %d 个\n", s.translateWorkflowStatus(status), count)
	}

	return message
}

func (s *AIService) hasPermission(permissions []model.Permission, resource, action string) bool {
	for _, perm := range permissions {
		if perm.Resource == resource || perm.Resource == "*" {
			for _, allowedAction := range perm.Actions {
				if allowedAction == action || allowedAction == "*" {
					return true
				}
			}
		}
	}
	return false
}

// Translation helper functions
func (s *AIService) translateStatus(status string) string {
	translations := map[string]string{
		"online":         "在线",
		"offline":        "离线",
		"maintenance":    "维护中",
		"decommissioned": "已下线",
		"pending":        "待部署",
	}
	if translation, exists := translations[status]; exists {
		return translation
	}
	return status
}

func (s *AIService) translateWorkflowStatus(status string) string {
	translations := map[string]string{
		"pending":  "待审批",
		"approved": "已批准",
		"rejected": "已拒绝",
	}
	if translation, exists := translations[status]; exists {
		return translation
	}
	return status
}

func (s *AIService) translateAssetStatus(status string) string {
	return s.translateStatus(status)
}

func (s *AIService) translateRole(role string) string {
	translations := map[string]string{
		"admin":    "管理员",
		"manager":  "经理",
		"operator": "操作员",
		"viewer":   "查看者",
	}
	if translation, exists := translations[role]; exists {
		return translation
	}
	return role
}

func (s *AIService) translateUserStatus(status string) string {
	translations := map[string]string{
		"active":   "激活",
		"inactive": "未激活",
		"locked":   "已锁定",
	}
	if translation, exists := translations[status]; exists {
		return translation
	}
	return status
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// handleWithRules handles queries using the original rule-based system as fallback
func (s *AIService) handleWithRules(ctx context.Context, userID string, query string, language string, userPermissions []model.Permission) (*AIResponse, error) {
	// Analyze the intent of the query
	intent := s.analyzeIntent(query)

	// Process based on intent
	switch intent {
	case QueryAssets:
		return s.handleAssetQuery(ctx, query, userPermissions)
	case QueryWorkflows:
		return s.handleWorkflowQuery(ctx, query, userID, userPermissions)
	case QueryStats:
		return s.handleStatsQuery(ctx, userPermissions)
	case QueryAssetDetails:
		return s.handleAssetDetailsQuery(ctx, query, userPermissions)
	case QueryUserInfo:
		return s.handleUserInfoQuery(ctx, userID)
	case QuerySystemStatus:
		return s.handleSystemStatusQuery(ctx, userPermissions)
	case QueryHelp:
		return s.handleHelpQuery(), nil
	default:
		return s.handleUnknownQuery(query), nil
	}
}

// combineAIWithData combines Zhipu AI response with actual system data
func (s *AIService) combineAIWithData(aiResponse *ChatResponse, dataResponse *AIResponse, language string) *AIResponse {
	// Create enhanced message combining AI insight with real data
	var combinedMessage string

	if language == "en" {
		combinedMessage = fmt.Sprintf("%s\n\n📊 **Current Data:**\n%s",
			aiResponse.Response,
			dataResponse.Message)
	} else {
		combinedMessage = fmt.Sprintf("%s\n\n📊 **实时数据：**\n%s",
			aiResponse.Response,
			dataResponse.Message)
	}

	// Combine suggestions from both AI and data responses
	combinedSuggestions := make([]string, 0)

	// Add AI suggestions first
	combinedSuggestions = append(combinedSuggestions, aiResponse.Suggestions...)

	// Add data-specific suggestions
	for _, suggestion := range dataResponse.Suggestions {
		// Avoid duplicates
		found := false
		for _, existing := range combinedSuggestions {
			if existing == suggestion {
				found = true
				break
			}
		}
		if !found {
			combinedSuggestions = append(combinedSuggestions, suggestion)
		}
	}

	// Limit to max 6 suggestions
	if len(combinedSuggestions) > 6 {
		combinedSuggestions = combinedSuggestions[:6]
	}

	return &AIResponse{
		Message:     combinedMessage,
		Intent:      dataResponse.Intent,
		Data:        dataResponse.Data,
		Suggestions: combinedSuggestions,
	}
}
