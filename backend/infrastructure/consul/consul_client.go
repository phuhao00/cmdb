package consul

import (
	"fmt"
	"log"
	"strconv"

	"github.com/hashicorp/consul/api"
)

// ConsulClient provides integration with Consul for service discovery and configuration
type ConsulClient struct {
	client *api.Client
}

// NewConsulClient creates a new Consul client
func NewConsulClient(address string) (*ConsulClient, error) {
	config := api.DefaultConfig()
	config.Address = address
	
	client, err := api.NewClient(config)
	if err != nil {
		return nil, err
	}
	
	return &ConsulClient{
		client: client,
	}, nil
}

// RegisterService registers the CMDB service with Consul
func (c *ConsulClient) RegisterService(serviceID string, serviceName string, address string, port int, tags []string) error {
	registration := &api.AgentServiceRegistration{
		ID:      serviceID,
		Name:    serviceName,
		Address: address,
		Port:    port,
		Tags:    tags,
		Check: &api.AgentServiceCheck{
			HTTP:                           fmt.Sprintf("http://%s:%d/health", address, port),
			Interval:                       "10s",
			Timeout:                        "5s",
			DeregisterCriticalServiceAfter: "30s",
		},
	}
	
	return c.client.Agent().ServiceRegister(registration)
}

// DeregisterService deregisters the CMDB service from Consul
func (c *ConsulClient) DeregisterService(serviceID string) error {
	return c.client.Agent().ServiceDeregister(serviceID)
}

// GetServiceInstances gets all instances of a service
func (c *ConsulClient) GetServiceInstances(serviceName string) ([]*api.ServiceEntry, error) {
	services, _, err := c.client.Health().Service(serviceName, "", true, nil)
	return services, err
}

// GetConfig gets a configuration value from Consul KV store
func (c *ConsulClient) GetConfig(key string) (string, error) {
	pair, _, err := c.client.KV().Get(key, nil)
	if err != nil {
		return "", err
	}
	
	if pair == nil {
		return "", fmt.Errorf("key not found: %s", key)
	}
	
	return string(pair.Value), nil
}

// GetConfigWithDefault gets a configuration value from Consul KV store with a default value
func (c *ConsulClient) GetConfigWithDefault(key string, defaultValue string) string {
	value, err := c.GetConfig(key)
	if err != nil {
		log.Printf("Failed to get config %s: %v, using default: %s", key, err, defaultValue)
		return defaultValue
	}
	return value
}

// GetIntConfig gets an integer configuration value from Consul KV store
func (c *ConsulClient) GetIntConfig(key string, defaultValue int) int {
	strValue, err := c.GetConfig(key)
	if err != nil {
		log.Printf("Failed to get config %s: %v, using default: %d", key, err, defaultValue)
		return defaultValue
	}
	
	intValue, err := strconv.Atoi(strValue)
	if err != nil {
		log.Printf("Failed to parse config %s as int: %v, using default: %d", key, err, defaultValue)
		return defaultValue
	}
	
	return intValue
}

// SetConfig sets a configuration value in Consul KV store
func (c *ConsulClient) SetConfig(key string, value string) error {
	pair := &api.KVPair{
		Key:   key,
		Value: []byte(value),
	}
	
	_, err := c.client.KV().Put(pair, nil)
	return err
}

// WatchConfig watches for changes to a configuration key
func (c *ConsulClient) WatchConfig(key string, handler func(string)) error {
	// In a real implementation, this would use Consul's watch functionality
	// For simplicity, we'll just return the current value
	value, err := c.GetConfig(key)
	if err != nil {
		return err
	}
	
	handler(value)
	return nil
}