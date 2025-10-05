
import { Injectable } from '@nestjs/common';
import { Lead, ProcessedLead, ServicePackage, IAProduct } from './interfaces/lead.interface';

@Injectable()
export class AiLeadsService {
  // Catálogo de tus servicios de System-137
  private readonly packages: Record<string, ServicePackage> = {
    comienza: {
      name: 'Comienza',
      price: 800,
      description: 'Landing Page + WhatsApp + 1 red social + SEO básico',
      ideal: ['emprendedores', 'negocios nuevos', 'presencia básica']
    },
    crece: {
      name: 'Crece',
      price: 1800,
      description: 'Web corporativa (5 secciones) + 2 redes sociales + SEO + Analytics',
      ideal: ['pequeñas empresas', 'servicios profesionales']
    },
    lidera: {
      name: 'Lidera',
      price: 3600,
      description: 'Tienda online + 2 redes sociales + Ads + reportes mensuales',
      ideal: ['ventas online', 'negocios establecidos']
    }
  };

  private readonly iaProducts: Record<string, IAProduct> = {
    reservas: {
      name: 'Automatización de Reservas',
      price: 600,
      monthlyPrice: 80,
      description: 'Google Calendar/Outlook + confirmaciones automáticas',
      ideal: ['hotel', 'lodging', 'restaurant', 'spa']
    },
    recordatorios: {
      name: 'Recordatorios de Citas',
      price: 400,
      monthlyPrice: 50,
      description: 'Mensajes automáticos WhatsApp/SMS/Email',
      ideal: ['health', 'dentist', 'doctor', 'salon', 'spa']
    },
    pedidos: {
      name: 'Notificación de Pedidos',
      price: 300,
      monthlyPrice: 50,
      description: 'Aviso automático de pedidos Shopify/WooCommerce',
      ideal: ['restaurant', 'store', 'food']
    },
    chatbot: {
      name: 'Chatbot de Atención',
      price: 500,
      monthlyPrice: 50,
      description: 'Responde preguntas frecuentes 24/7',
      ideal: ['restaurant', 'store', 'gym', 'commerce']
    },
    pagos: {
      name: 'Confirmación de Pagos',
      price: 400,
      monthlyPrice: 50,
      description: 'Verifica pagos Stripe/MercadoPago/PayPal',
      ideal: ['store', 'gym', 'membership']
    }
  };

  /**
   * Método principal: procesa un array de leads
   */
  async processLeads(leads: Lead[]): Promise<ProcessedLead[]> {
    const processedLeads = leads
      .map(lead => this.analyzeLead(lead))
      .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));

    return processedLeads;
  }

  /**
   * Analiza un lead individual y genera recomendaciones
   */
  private analyzeLead(lead: Lead): ProcessedLead {
    const types = lead.Types?.toLowerCase() || '';
    const name = lead.Name?.toLowerCase() || '';
    
    // Validar si tiene teléfono válido
    const hasPhone: boolean = !!(lead.Phone && lead.Phone !== 'N/A' && lead.Phone.trim() !== '');
    
    // Validar si tiene ratings
    const hasRatings: boolean = !!(lead.TotalRatings && parseInt(lead.TotalRatings) > 0);

    // 1. Clasificar tipo de negocio
    const businessType = this.classifyBusiness(types, name);
    
    // 2. Recomendar paquete
    const recommendedPackage = this.recommendPackage(businessType, hasRatings);
    
    // 3. Recomendar servicios de IA
    const recommendedServices = this.recommendIAServices(businessType);
    
    // 4. Calcular prioridad
    const priority = this.calculatePriority(lead, businessType, hasPhone, hasRatings);
    
    // 5. Generar mensaje personalizado
    const personalizedMessage = this.generateMessage(
      lead,
      businessType,
      recommendedPackage,
      recommendedServices
    );

    // 6. Calcular presupuesto
    const estimatedBudget = this.calculateBudget(recommendedPackage, recommendedServices);

    return {
      ...lead,
      businessType,
      recommendedPackage,
      recommendedServices,
      personalizedMessage,
      priority,
      estimatedBudget
    };
  }

  /**
   * Clasifica el tipo de negocio basado en Types y Name
   */
  private classifyBusiness(types: string, name: string): string {
    if (types.includes('lodging') || name.includes('hospedaje') || name.includes('hotel')) {
      return 'hotel';
    }
    if (types.includes('restaurant') || types.includes('food') || name.includes('restaurant')) {
      return 'restaurant';
    }
    if (types.includes('health') || types.includes('pharmacy') || name.includes('salud') || name.includes('botica')) {
      return 'health';
    }
    if (types.includes('store') || types.includes('shop') || types.includes('supermarket') || name.includes('bodega')) {
      return 'store';
    }
    if (types.includes('church') || name.includes('iglesia')) {
      return 'church';
    }
    if (types.includes('school') || name.includes('educativa') || name.includes('colegio')) {
      return 'school';
    }
    if (name.includes('ferreteria') || types.includes('hardware')) {
      return 'hardware';
    }
    if (name.includes('mecanica') || types.includes('car_repair')) {
      return 'mechanic';
    }
    if (name.includes('municipalidad') || types.includes('local_government')) {
      return 'government';
    }
    return 'general';
  }

  /**
   * Recomienda un paquete según el tipo de negocio
   */
  private recommendPackage(businessType: string, hasPresence: boolean): string {
    const highValueTypes = ['hotel', 'restaurant', 'health'];
    const mediumValueTypes = ['store', 'hardware', 'school'];

    if (highValueTypes.includes(businessType)) {
      return hasPresence ? 'Lidera' : 'Crece';
    }
    if (mediumValueTypes.includes(businessType)) {
      return hasPresence ? 'Crece' : 'Comienza';
    }
    return 'Comienza';
  }

  /**
   * Recomienda servicios de IA según el tipo de negocio
   */
  private recommendIAServices(businessType: string): string[] {
    const recommendations: string[] = [];

    const mapping: Record<string, string[]> = {
      hotel: ['Automatización de Reservas', 'Chatbot de Atención'],
      restaurant: ['Notificación de Pedidos', 'Automatización de Reservas'],
      health: ['Recordatorios de Citas', 'Chatbot de Atención'],
      store: ['Notificación de Pedidos', 'Confirmación de Pagos'],
      hardware: ['Chatbot de Atención', 'Notificación de Pedidos'],
      school: ['Confirmación de Pagos', 'Chatbot de Atención'],
      mechanic: ['Recordatorios de Citas', 'Chatbot de Atención'],
    };

    return mapping[businessType]?.slice(0, 2) || ['Chatbot de Atención'];
  }

  /**
   * Calcula la prioridad del lead
   */
  private calculatePriority(
    lead: Lead, 
    businessType: string, 
    hasPhone: boolean,
    hasRatings: boolean
  ): 'high' | 'medium' | 'low' {
    if (!hasPhone) return 'low';

    const highValueTypes = ['hotel', 'restaurant', 'health', 'store'];
    const ratings = parseInt(lead.TotalRatings || '0');
    
    if (highValueTypes.includes(businessType) && ratings >= 5) {
      return 'high';
    }
    if (hasRatings && hasPhone && ratings > 0) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Genera el mensaje personalizado
   */
  private generateMessage(
    lead: Lead,
    businessType: string,
    packageName: string,
    services: string[]
  ): string {
    const businessName = lead.Name;

    // Mensajes contextualizados por tipo de negocio
    const contextMessages: Record<string, string> = {
      hotel: `Vi que ${businessName} ofrece hospedaje en San Luis de Shuaro. 🏨\n\nNos especializamos en ayudar a hoteles y hospedajes a:\n✅ Automatizar reservas (Google Calendar + WhatsApp)\n✅ Aumentar reservas con presencia digital profesional\n✅ Gestionar redes sociales para atraer más huéspedes`,
      
      restaurant: `Hola, noté que ${businessName} es un restaurante/comedor en la zona. 🍽️\n\nPodemos ayudarles a:\n✅ Sistema de pedidos online\n✅ Notificaciones automáticas de pedidos\n✅ Presencia en redes sociales para atraer más clientes`,
      
      health: `Buenos días, vi que ${businessName} ofrece servicios de salud. 🏥\n\nNos especializamos en:\n✅ Sistema de recordatorios de citas automáticos (WhatsApp/SMS)\n✅ Reducir ausencias de pacientes\n✅ Mejorar su presencia digital profesional`,
      
      store: `Hola, noté que ${businessName} es un comercio local. 🛒\n\nPodemos ayudarles a:\n✅ Vender productos online\n✅ Gestión profesional de redes sociales\n✅ Notificaciones automáticas de pedidos`,
      
      general: `Hola, vi su negocio ${businessName} en San Luis de Shuaro.\n\nEn System-137 nos especializamos en ayudar a negocios locales a crecer en internet con:\n✅ Presencia web profesional\n✅ Gestión de redes sociales\n✅ Automatizaciones que ahorran tiempo`
    };

    const contextMessage = contextMessages[businessType] || contextMessages.general;

    // Recomendación de paquete
    const packageInfo = this.packages[packageName.toLowerCase()];
    const packageMessage = `\n\n📦 Les recomendaría nuestro paquete "${packageName}" (S/ ${packageInfo.price}/mes):\n${packageInfo.description}`;

    // Servicios de IA
    let servicesMessage = '';
    if (services.length > 0) {
      servicesMessage = `\n\n🤖 Productos de IA ideales para ustedes:\n`;
      services.forEach(service => {
        const iaProduct = Object.values(this.iaProducts).find(p => p.name === service);
        if (iaProduct) {
          servicesMessage += `✅ ${service} (S/ ${iaProduct.price} setup + S/ ${iaProduct.monthlyPrice}/mes)\n`;
        }
      });
    }

    // Call to action
    const cta = `\n\n¿Les gustaría que conversemos 15 minutos sin compromiso sobre cómo podemos ayudarles?\n\nSaludos,\nSystem-137 🚀\nTransformamos negocios con tecnología`;

    return `${contextMessage}${packageMessage}${servicesMessage}${cta}`;
  }

  /**
   * Calcula el presupuesto estimado
   */
  private calculateBudget(packageName: string, services: string[]): string {
    const packageInfo = this.packages[packageName.toLowerCase()];
    let setupCost = 0;
    let monthlyCost = packageInfo.price;

    services.forEach(service => {
      const iaProduct = Object.values(this.iaProducts).find(p => p.name === service);
      if (iaProduct) {
        setupCost += iaProduct.price;
        monthlyCost += iaProduct.monthlyPrice;
      }
    });

    if (setupCost > 0) {
      return `S/ ${setupCost} inicial + S/ ${monthlyCost}/mes`;
    }
    return `S/ ${monthlyCost}/mes`;
  }

  /**
   * Obtiene el score numérico de prioridad
   */
  private getPriorityScore(priority: string): number {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[priority as keyof typeof scores] || 0;
  }

  /**
   * Genera estadísticas del procesamiento
   */
  getStatistics(leads: ProcessedLead[]) {
    return {
      total: leads.length,
      highPriority: leads.filter(l => l.priority === 'high').length,
      mediumPriority: leads.filter(l => l.priority === 'medium').length,
      lowPriority: leads.filter(l => l.priority === 'low').length,
      withPhone: leads.filter(l => l.Phone && l.Phone !== 'N/A').length,
      withoutPhone: leads.filter(l => !l.Phone || l.Phone === 'N/A').length,
    };
  }
}