# n8n Campaign Integration Guide

## 🎯 Overview

This guide explains how to integrate A2Z Business Directory's campaign management system with n8n automation for WhatsApp and Facebook posting.

## 🔗 API Endpoints

### Base URL
```
https://your-domain.com/api/n8n/webhook
```

### Available Endpoints

#### 1. POST - Log Campaign Execution
**URL:** `POST /api/n8n/webhook`

**Purpose:** Log campaign execution results from n8n

**Payload:**
```json
{
  "campaign_id": "uuid",
  "group_id": "uuid",
  "execution_id": "n8n_execution_id",
  "status": "sent|failed|pending",
  "error_message": "Error details if failed",
  "members_reached": 150,
  "platform": "whatsapp|facebook",
  "group_name": "Business Network SA"
}
```

#### 2. GET - Retrieve Campaign Data
**URL:** `GET /api/n8n/webhook?campaign_id=uuid&action=get_campaign_data`

**Response:**
```json
{
  "campaign": {
    "id": "uuid",
    "campaign_name": "Weekly Promotion",
    "message_content": "Check out our latest offers!",
    "image_urls": ["https://example.com/image.jpg"],
    "target_platforms": ["whatsapp", "facebook"],
    "max_groups_per_day": 50,
    "max_members_per_group_per_day": 10
  },
  "webhook_url": "https://your-domain.com/api/n8n/webhook",
  "total_groups": 25
}
```

#### 3. GET - Get Next Groups to Post
**URL:** `GET /api/n8n/webhook?campaign_id=uuid&action=get_next_groups`

**Response:**
```json
{
  "groups": [
    {
      "campaign_group_id": "uuid",
      "group_id": "uuid",
      "group_name": "Business Network SA",
      "platform": "whatsapp",
      "group_url": "https://chat.whatsapp.com/example",
      "member_count": 150,
      "max_members_to_reach": 10,
      "priority": 1
    }
  ],
  "remaining_groups": 45,
  "total_available": 5
}
```

#### 4. GET - Check Daily Limits
**URL:** `GET /api/n8n/webhook?campaign_id=uuid&action=check_limits`

**Response:**
```json
{
  "can_post": true,
  "groups_posted_today": 5,
  "max_groups_per_day": 50,
  "remaining_groups": 45
}
```

#### 5. PUT - Update Campaign Status
**URL:** `PUT /api/n8n/webhook`

**Payload:**
```json
{
  "campaign_id": "uuid",
  "status": "active|paused|completed|cancelled",
  "n8n_workflow_id": "workflow_123"
}
```

## 🤖 n8n Workflow Setup

### Workflow Structure

1. **Trigger Node** - Cron/Schedule trigger for weekly campaigns
2. **HTTP Request Node** - Check daily limits
3. **IF Node** - Check if posting is allowed
4. **HTTP Request Node** - Get next groups to post
5. **Split In Batches Node** - Process groups one by one
6. **WhatsApp/Facebook Nodes** - Send messages to groups
7. **HTTP Request Node** - Log execution results

### Sample n8n Workflow Nodes

#### 1. Schedule Trigger
```json
{
  "rule": {
    "interval": [
      {
        "field": "cronExpression",
        "value": "0 9 * * 1-5"
      }
    ]
  }
}
```

#### 2. Check Limits HTTP Request
```json
{
  "method": "GET",
  "url": "https://your-domain.com/api/n8n/webhook",
  "qs": {
    "campaign_id": "{{$node['Set Campaign ID'].json['campaign_id']}}",
    "action": "check_limits"
  }
}
```

#### 3. Get Next Groups HTTP Request
```json
{
  "method": "GET",
  "url": "https://your-domain.com/api/n8n/webhook",
  "qs": {
    "campaign_id": "{{$node['Set Campaign ID'].json['campaign_id']}}",
    "action": "get_next_groups"
  }
}
```

#### 4. WhatsApp Send Message
```json
{
  "chatId": "{{$json['group_url']}}",
  "message": "{{$node['Get Campaign Data'].json['campaign']['message_content']}}",
  "mediaUrl": "{{$node['Get Campaign Data'].json['campaign']['image_urls'][0]}}"
}
```

#### 5. Log Execution Result
```json
{
  "method": "POST",
  "url": "https://your-domain.com/api/n8n/webhook",
  "body": {
    "campaign_id": "{{$node['Set Campaign ID'].json['campaign_id']}}",
    "group_id": "{{$json['group_id']}}",
    "execution_id": "{{$workflow.id}}_{{$execution.id}}",
    "status": "sent",
    "members_reached": "{{$json['member_count']}}",
    "platform": "{{$json['platform']}}",
    "group_name": "{{$json['group_name']}}"
  }
}
```

## 📋 Campaign Limits & Rules

### Daily Limits
- **Maximum 50 groups** per campaign per day
- **Maximum 10 members** reached per group per day
- Limits reset at midnight UTC

### Posting Rules
1. Check daily limits before posting
2. Get available groups that haven't been posted to today
3. Post to groups in priority order
4. Log all execution results (success/failure)
5. Update campaign statistics

### Error Handling
- Log failed executions with error messages
- Skip groups that have reached daily limits
- Retry failed posts with exponential backoff

## 🔧 Setup Steps

### 1. Create n8n Workflow
1. Import the sample workflow JSON
2. Configure your WhatsApp/Facebook credentials
3. Set the campaign ID in the workflow
4. Test the workflow with a small group

### 2. Configure Campaign in A2Z
1. Create a new campaign in the dashboard
2. Add your n8n webhook URL
3. Select target groups
4. Set daily limits (50 groups, 10 members)
5. Schedule for weekly repeat

### 3. Test Integration
1. Run the n8n workflow manually
2. Check campaign execution logs in A2Z
3. Verify posts are sent to groups
4. Monitor daily limit enforcement

## 📊 Monitoring & Analytics

### Campaign Dashboard
- View total posts sent
- Track groups reached
- Monitor daily limits
- See execution history

### n8n Monitoring
- Check workflow execution logs
- Monitor success/failure rates
- Set up alerts for failed executions

## 🚨 Best Practices

### Rate Limiting
- Respect platform rate limits
- Add delays between posts (2-5 seconds)
- Monitor for API errors

### Content Guidelines
- Follow WhatsApp/Facebook terms of service
- Avoid spam-like behavior
- Use relevant, valuable content

### Group Management
- Regularly update group member counts
- Remove inactive groups
- Respect group rules and admins

## 🔐 Security

### API Security
- Use HTTPS for all requests
- Validate webhook signatures
- Implement rate limiting

### Data Protection
- Don't log sensitive user data
- Encrypt stored credentials
- Follow GDPR compliance

## 📞 Support

For technical support with the integration:
1. Check the campaign execution logs
2. Review n8n workflow errors
3. Verify API endpoint responses
4. Contact support with specific error messages
