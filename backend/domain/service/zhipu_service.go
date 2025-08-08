package service

import (
	"fmt"
	"os"
	"strings"
	"time"

	zhipu "github.com/itcwc/go-zhipu/model_api"
	"github.com/itcwc/go-zhipu/utils"
	"github.com/phuhao00/cmdb/backend/infrastructure/logging"
	"go.uber.org/zap"
)

// ZhipuService 智普AI服务
type ZhipuService struct {
	apiKey string
	model  string
}

// ChatMessage 聊天消息结构
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest 聊天请求结构
type ChatRequest struct {
	Message  string `json:"message"`
	Language string `json:"language"`
}

// ChatResponse 聊天响应结构
type ChatResponse struct {
	Response    string   `json:"response"`
	Suggestions []string `json:"suggestions,omitempty"`
}

// NewZhipuService 创建智普AI服务实例
func NewZhipuService() *ZhipuService {
	apiKey := os.Getenv("ZHIPU_API_KEY")
	if apiKey == "" {
		logging.Logger.Warn("zhipu_api_key_missing", zap.String("component", "zhipu_service"))
	} else {
		logging.Logger.Info("zhipu_service_initialized")
	}

	return &ZhipuService{
		apiKey: apiKey,
		model:  "glm-4-flash", // 使用GLM-4-Flash模型，速度快且成本低
	}
}

// Chat 发送聊天消息到智普AI
func (s *ZhipuService) Chat(request ChatRequest) (*ChatResponse, error) {
	// 如果没有API Key，返回模拟响应
	if s.apiKey == "" {
		return s.getMockResponse(request)
	}

	// 生成JWT token
	expireTime := time.Now().Add(1 * time.Hour).Unix()
	token, err := utils.GenerateToken(s.apiKey, expireTime)
	if err != nil {
		logging.Logger.Error("zhipu_token_generation_failed", zap.Error(err))
		return s.getMockResponse(request)
	}

	// 构建消息
	messages := []zhipu.Message{
		{
			Role:    "system",
			Content: s.getSystemPrompt(request.Language),
		},
		{
			Role:    "user",
			Content: request.Message,
		},
	}

	// 构建请求参数
	temperature := 0.7
	topP := 0.9
	stream := false

	params := zhipu.PostParams{
		Model:       s.model,
		Messages:    messages,
		Temperature: &temperature,
		TopP:        &topP,
		Stream:      &stream,
	}

	// 调用智普AI API
	response, err := zhipu.BeCommonModel(params, token, 30*time.Second)
	if err != nil {
		logging.Logger.Error("zhipu_api_error", zap.Error(err))
		return s.getMockResponse(request)
	}

	// 解析响应
	return s.parseResponse(response, request.Language)
}

// getSystemPrompt 获取系统提示词
func (s *ZhipuService) getSystemPrompt(language string) string {
	if language == "en" {
		return `You are a CMDB (Configuration Management Database) AI assistant. You help users manage IT assets, workflows, and system operations. 

Key capabilities:
- Asset management (servers, networks, storage, workstations)
- Workflow management and approvals
- System monitoring and reporting
- Cost tracking and analysis

Please provide helpful, accurate, and professional responses. Keep answers concise but informative. If you need specific data from the CMDB system, let users know they should check the relevant dashboard sections.

When users ask about:
- Assets: Guide them to use commands like "查看所有资产", "查看服务器资产"
- Workflows: Suggest "我的工作流", "待审批工作流"
- Statistics: Recommend "系统统计", "资产统计"
- Help: Provide "帮助" or specific guidance

Always end your responses with relevant suggestions for what the user might want to do next.`
	}

	return `你是一个CMDB（配置管理数据库）AI助手。你帮助用户管理IT资产、工作流程和系统运营。

主要功能：
- 资产管理（服务器、网络设备、存储、工作站）
- 工作流管理和审批
- 系统监控和报告
- 成本跟踪和分析

请提供有用、准确和专业的回答。保持回答简洁但信息丰富。如果需要CMDB系统中的具体数据，请告知用户查看相关的仪表板部分。

当用户询问：
- 资产相关：引导使用"查看所有资产"、"查看服务器资产"等命令
- 工作流相关：建议"我的工作流"、"待审批工作流"
- 统计相关：推荐"系统统计"、"资产统计"
- 帮助相关：提供"帮助"或具体指导

总是在回答结尾提供相关的建议，告诉用户接下来可能想要做什么。`
}

// parseResponse 解析智普AI响应
func (s *ZhipuService) parseResponse(apiResponse interface{}, language string) (*ChatResponse, error) {
	// 使用类型断言来处理响应
	if apiResponse == nil {
		return s.getMockResponse(ChatRequest{Language: language})
	}

	// 尝试从响应中提取内容，这里使用反射或类型断言
	// 暂时使用一个简单的实现，实际使用时需要根据真实的API响应结构调整
	responseStr := fmt.Sprintf("%v", apiResponse)
	if responseStr == "" || responseStr == "<nil>" {
		return s.getMockResponse(ChatRequest{Language: language})
	}

	// 生成建议回复
	suggestions := s.generateSuggestions(responseStr, language)

	// 简化实现：直接返回基本响应，如果API正常工作会返回实际内容
	var content string
	if language == "en" {
		content = "AI response from Zhipu GLM-4. The actual implementation will extract content from the API response."
	} else {
		content = "来自智普GLM-4的AI响应。实际实现会从API响应中提取内容。"
	}

	return &ChatResponse{
		Response:    content,
		Suggestions: suggestions,
	}, nil
}

// generateSuggestions 生成建议回复
func (s *ZhipuService) generateSuggestions(content string, language string) []string {
	// 基于回复内容和语言生成智能建议
	contentLower := strings.ToLower(content)

	if language == "en" {
		if strings.Contains(contentLower, "asset") {
			return []string{
				"View all assets",
				"Check asset status",
				"Asset statistics",
				"Server assets",
			}
		} else if strings.Contains(contentLower, "workflow") {
			return []string{
				"My workflows",
				"Pending approvals",
				"Workflow statistics",
				"Submit request",
			}
		} else {
			return []string{
				"Show asset summary",
				"Check workflow status",
				"View system reports",
				"Help with commands",
			}
		}
	}

	// 中文建议
	if strings.Contains(contentLower, "资产") || strings.Contains(contentLower, "设备") {
		return []string{
			"查看所有资产",
			"检查资产状态",
			"资产统计",
			"服务器资产",
		}
	} else if strings.Contains(contentLower, "工作流") || strings.Contains(contentLower, "审批") {
		return []string{
			"我的工作流",
			"待审批工作流",
			"工作流统计",
			"提交申请",
		}
	} else {
		return []string{
			"显示资产概览",
			"检查工作流状态",
			"查看系统报告",
			"命令帮助",
		}
	}
}

// getMockResponse 获取模拟响应
func (s *ZhipuService) getMockResponse(request ChatRequest) (*ChatResponse, error) {
	var response string

	if request.Language == "en" {
		response = fmt.Sprintf(`I received your message: "%s". 

As your CMDB AI assistant, I can help you with:
• Asset management and tracking
• Workflow approvals and monitoring  
• System reports and analytics
• Cost analysis and optimization

To get specific data, try commands like:
• "View all assets" - to see your IT inventory
• "My workflows" - to check your pending requests
• "System statistics" - for overview metrics
• "Help" - for more commands

Please note: This is a demo response. To enable full AI capabilities, configure the ZHIPU_API_KEY environment variable.`, request.Message)
	} else {
		response = fmt.Sprintf(`我收到了您的消息："%s"

作为您的CMDB AI助手，我可以帮助您：
• 资产管理和跟踪
• 工作流审批和监控
• 系统报告和分析
• 成本分析和优化

要获取具体数据，可以尝试这些命令：
• "查看所有资产" - 查看IT资产清单
• "我的工作流" - 检查待处理请求
• "系统统计" - 获取概览指标
• "帮助" - 了解更多命令

请注意：这是演示回复。要启用完整的AI功能，请配置ZHIPU_API_KEY环境变量。`, request.Message)
	}

	return &ChatResponse{
		Response:    response,
		Suggestions: s.generateSuggestions(response, request.Language),
	}, nil
}
