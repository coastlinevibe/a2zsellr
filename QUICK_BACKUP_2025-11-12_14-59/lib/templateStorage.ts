// Template Storage System for A2Z Sellr
// Manages custom templates for listings

export interface InteractiveElement {
  id: string
  x: number // Percentage (0-100)
  y: number // Percentage (0-100)
  type: 'product' | 'cta' | 'info' | 'custom'
  action: string
  data: any
  width?: number
  height?: number
  label?: string
}

export interface Template {
  id: string
  name: string
  description?: string
  content: string // HTML content
  style: string // CSS styles
  interactions: InteractiveElement[]
  category: string
  thumbnail?: string
  isPublic?: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  industry?: string
}

// Pre-built template library
export const templateLibrary: Template[] = [
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description: 'Perfect for restaurants and food businesses',
    category: 'food-dining',
    industry: 'restaurant',
    tags: ['food', 'menu', 'restaurant', 'dining'],
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: `
      <div class="restaurant-template">
        <div class="header">
          <div class="logo-section">
            <div class="restaurant-logo">{{businessName.charAt(0)}}</div>
            <div class="restaurant-info">
              <h1>{{businessName}}</h1>
              <p class="cuisine-type">Fine Dining Experience</p>
            </div>
          </div>
          <div class="rating-badge">
            <span class="stars">★★★★★</span>
            <span class="rating">4.8</span>
          </div>
        </div>
        
        <div class="featured-section">
          <h2>{{title}}</h2>
          <p class="description">{{message}}</p>
        </div>
        
        <div class="menu-grid">
          {{#each items}}
          <div class="menu-item" data-product-id="{{id}}">
            <img src="{{url}}" alt="{{name}}" />
            <div class="item-info">
              <h3>{{name}}</h3>
              {{#if price}}<span class="price">R{{price}}</span>{{/if}}
            </div>
          </div>
          {{/each}}
        </div>
        
        <div class="action-section">
          <button class="order-button">{{ctaLabel}}</button>
          <p class="contact-info">Call us or visit our location</p>
        </div>
      </div>
    `,
    style: `
      .restaurant-template {
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom, #2c1810, #8b4513);
        color: #f5f5dc;
        padding: 25px;
        font-family: 'Georgia', serif;
        display: flex;
        flex-direction: column;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 20px;
      }
      
      .logo-section {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .restaurant-logo {
        width: 70px;
        height: 70px;
        background: #d4af37;
        color: #2c1810;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: bold;
        border: 3px solid #f5f5dc;
      }
      
      .restaurant-info h1 {
        font-size: 24px;
        margin: 0;
        color: #d4af37;
      }
      
      .cuisine-type {
        font-size: 14px;
        margin: 5px 0 0 0;
        opacity: 0.8;
        font-style: italic;
      }
      
      .rating-badge {
        text-align: center;
      }
      
      .stars {
        color: #d4af37;
        font-size: 16px;
      }
      
      .rating {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: #d4af37;
      }
      
      .featured-section {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .featured-section h2 {
        font-size: 26px;
        color: #d4af37;
        margin: 0 0 15px 0;
      }
      
      .description {
        font-size: 16px;
        line-height: 1.6;
        margin: 0;
        opacity: 0.9;
      }
      
      .menu-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 30px;
        flex: 1;
      }
      
      .menu-item {
        background: rgba(245, 245, 220, 0.1);
        border: 1px solid #d4af37;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      
      .menu-item:hover {
        transform: scale(1.05);
      }
      
      .menu-item img {
        width: 100%;
        height: 120px;
        object-fit: cover;
      }
      
      .item-info {
        padding: 15px;
      }
      
      .item-info h3 {
        font-size: 16px;
        margin: 0 0 8px 0;
        color: #f5f5dc;
      }
      
      .price {
        font-size: 18px;
        font-weight: bold;
        color: #d4af37;
      }
      
      .action-section {
        text-align: center;
        margin-top: auto;
      }
      
      .order-button {
        width: 100%;
        background: #d4af37;
        color: #2c1810;
        border: none;
        padding: 18px 30px;
        border-radius: 25px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: 15px;
        transition: all 0.3s ease;
      }
      
      .order-button:hover {
        background: #b8941f;
        transform: translateY(-2px);
      }
      
      .contact-info {
        font-size: 12px;
        opacity: 0.7;
        margin: 0;
      }
    `,
    interactions: [
      {
        id: 'menu-item-1',
        x: 25,
        y: 65,
        type: 'product',
        action: 'show-product-details',
        data: { productIndex: 0 },
        width: 45,
        height: 25,
        label: 'View Menu Item'
      },
      {
        id: 'menu-item-2', 
        x: 75,
        y: 65,
        type: 'product',
        action: 'show-product-details',
        data: { productIndex: 1 },
        width: 45,
        height: 25,
        label: 'View Menu Item'
      },
      {
        id: 'order-cta',
        x: 50,
        y: 90,
        type: 'cta',
        action: 'contact-business',
        data: { method: 'whatsapp', message: 'I want to place an order' },
        width: 80,
        height: 12,
        label: 'Order Now'
      }
    ]
  },
  
  {
    id: 'retail-showcase',
    name: 'Retail Showcase',
    description: 'Perfect for retail stores and product showcases',
    category: 'retail',
    industry: 'retail',
    tags: ['retail', 'products', 'shopping', 'store'],
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: `
      <div class="retail-template">
        <div class="store-header">
          <div class="store-logo">{{businessName.charAt(0)}}</div>
          <div class="store-details">
            <h1>{{businessName}}</h1>
            <p class="store-tagline">Premium Quality Products</p>
          </div>
          <div class="store-badge">NEW</div>
        </div>
        
        <div class="promotion-banner">
          <h2>{{title}}</h2>
          <p>{{message}}</p>
        </div>
        
        <div class="product-showcase">
          {{#each items}}
          <div class="product-card" data-product-id="{{id}}">
            <div class="product-image">
              <img src="{{url}}" alt="{{name}}" />
              {{#if price}}<div class="price-tag">R{{price}}</div>{{/if}}
            </div>
            <div class="product-info">
              <h3>{{name}}</h3>
            </div>
          </div>
          {{/each}}
        </div>
        
        <div class="shop-action">
          <button class="shop-button">{{ctaLabel}}</button>
        </div>
      </div>
    `,
    style: `
      .retail-template {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 25px;
        font-family: 'Arial', sans-serif;
        display: flex;
        flex-direction: column;
      }
      
      .store-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 25px;
        position: relative;
      }
      
      .store-logo {
        width: 60px;
        height: 60px;
        background: rgba(255,255,255,0.2);
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        backdrop-filter: blur(10px);
      }
      
      .store-details h1 {
        font-size: 22px;
        margin: 0;
        font-weight: bold;
      }
      
      .store-tagline {
        font-size: 14px;
        margin: 5px 0 0 0;
        opacity: 0.8;
      }
      
      .store-badge {
        position: absolute;
        right: 0;
        top: 0;
        background: #ff6b6b;
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .promotion-banner {
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        margin-bottom: 25px;
        backdrop-filter: blur(10px);
      }
      
      .promotion-banner h2 {
        font-size: 24px;
        margin: 0 0 10px 0;
        font-weight: bold;
      }
      
      .promotion-banner p {
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
      }
      
      .product-showcase {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 25px;
        flex: 1;
      }
      
      .product-card {
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
      }
      
      .product-card:hover {
        transform: scale(1.05);
      }
      
      .product-image {
        position: relative;
        height: 120px;
      }
      
      .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .price-tag {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .product-info {
        padding: 15px;
      }
      
      .product-info h3 {
        font-size: 14px;
        margin: 0;
        font-weight: bold;
      }
      
      .shop-action {
        margin-top: auto;
      }
      
      .shop-button {
        width: 100%;
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.3);
        color: white;
        padding: 18px 30px;
        border-radius: 25px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }
      
      .shop-button:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-2px);
      }
    `,
    interactions: [
      {
        id: 'product-1',
        x: 25,
        y: 60,
        type: 'product',
        action: 'show-product-details',
        data: { productIndex: 0 },
        width: 40,
        height: 20,
        label: 'View Product'
      },
      {
        id: 'product-2',
        x: 75,
        y: 60,
        type: 'product', 
        action: 'show-product-details',
        data: { productIndex: 1 },
        width: 40,
        height: 20,
        label: 'View Product'
      }
    ]
  }
]

// Template Storage Manager
export class TemplateStorageManager {
  // Get all available templates
  static getAllTemplates(): Template[] {
    const customTemplates = this.getCustomTemplates()
    return [...templateLibrary, ...customTemplates]
  }

  // Get templates by category
  static getTemplatesByCategory(category: string): Template[] {
    return this.getAllTemplates().filter(template => template.category === category)
  }

  // Get templates by industry
  static getTemplatesByIndustry(industry: string): Template[] {
    return this.getAllTemplates().filter(template => template.industry === industry)
  }

  // Search templates
  static searchTemplates(query: string): Template[] {
    const searchTerm = query.toLowerCase()
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description?.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // Get template by ID
  static getTemplate(id: string): Template | undefined {
    return this.getAllTemplates().find(template => template.id === id)
  }

  // Save custom template
  static saveCustomTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    const newTemplate: Template = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const customTemplates = this.getCustomTemplates()
    customTemplates.push(newTemplate)
    this.setCustomTemplates(customTemplates)

    return newTemplate
  }

  // Update custom template
  static updateCustomTemplate(id: string, updates: Partial<Template>): Template | null {
    const customTemplates = this.getCustomTemplates()
    const templateIndex = customTemplates.findIndex(t => t.id === id)

    if (templateIndex === -1) return null

    customTemplates[templateIndex] = {
      ...customTemplates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.setCustomTemplates(customTemplates)
    return customTemplates[templateIndex]
  }

  // Delete custom template
  static deleteCustomTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates()
    const filteredTemplates = customTemplates.filter(t => t.id !== id)
    
    if (filteredTemplates.length === customTemplates.length) return false
    
    this.setCustomTemplates(filteredTemplates)
    return true
  }

  // Get custom templates from localStorage
  private static getCustomTemplates(): Template[] {
    try {
      const stored = localStorage.getItem('a2z_custom_templates')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Could not load custom templates:', error)
      return []
    }
  }

  // Save custom templates to localStorage
  private static setCustomTemplates(templates: Template[]): void {
    try {
      localStorage.setItem('a2z_custom_templates', JSON.stringify(templates))
    } catch (error) {
      console.warn('Could not save custom templates:', error)
    }
  }

  // Get recent templates
  static getRecentTemplates(): Template[] {
    try {
      const recent = localStorage.getItem('a2z_recent_templates')
      const recentIds = recent ? JSON.parse(recent) : []
      return recentIds.map((id: string) => this.getTemplate(id)).filter(Boolean)
    } catch (error) {
      console.warn('Could not load recent templates:', error)
      return []
    }
  }

  // Save recent template usage
  static saveRecentTemplate(templateId: string): void {
    try {
      const recent = this.getRecentTemplates().map(t => t.id)
      const updated = [templateId, ...recent.filter(id => id !== templateId)].slice(0, 10)
      localStorage.setItem('a2z_recent_templates', JSON.stringify(updated))
    } catch (error) {
      console.warn('Could not save recent template:', error)
    }
  }

  // Get template categories
  static getCategories(): string[] {
    const categories = new Set(this.getAllTemplates().map(t => t.category))
    return Array.from(categories)
  }

  // Get template industries
  static getIndustries(): string[] {
    const industries = new Set(
      this.getAllTemplates()
        .map(t => t.industry)
        .filter((industry): industry is string => Boolean(industry))
    )
    return Array.from(industries)
  }
}

export default TemplateStorageManager
