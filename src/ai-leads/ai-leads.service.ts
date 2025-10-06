// ============================================
// PASO 4: SERVICIO PRINCIPAL (SIN IA EXTERNA)
// Este servicio usa LÓGICA DE REGLAS para generar mensajes
// ============================================

// src/ai-leads/ai-leads.service.ts
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
  private classifyBusiness(types: string = '', name: string = ''): string {
    // Asegurar que sean strings
    types = types.toLowerCase();
    name = name.toLowerCase();
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
   * Genera el mensaje personalizado enfocado en beneficios
   */
  private generateMessage(
    lead: Lead,
    businessType: string,
    packageName: string,
    services: string[]
  ): string {
    const businessName = lead.Name || 'su negocio';
    const location = this.extractLocation(lead.Address);
    const locationText = location ? ` en ${location}` : '';
    const ratingsText = this.getRatingsText(lead);

    // Introducción contextualizada por tipo de negocio
    const introductions: Record<string, string> = {
      hotel: `Hola, vi que ${businessName} ofrece hospedaje${locationText}.${ratingsText}\n\nSoy de System-137 y nos especializamos en ayudar a hoteles y hospedajes a crecer digitalmente.`,
      
      restaurant: `Hola, noté que ${businessName} es un restaurante${locationText}.${ratingsText}\n\nSoy de System-137 y trabajamos con restaurantes ayudándolos a crecer su presencia digital.`,
      
      health: `Buenos días, vi que ${businessName} ofrece servicios de salud${locationText}.${ratingsText}\n\nSoy de System-137 y trabajamos con clínicas y consultorios mejorando su gestión digital.`,
      
      store: `Hola, noté que ${businessName} es un comercio local${locationText}.${ratingsText}\n\nSoy de System-137 y ayudamos a comercios locales a vender más usando tecnología.`,
      
      hardware: `Hola, vi que ${businessName}${locationText}.${ratingsText}\n\nSoy de System-137 y trabajamos con ferreterías ayudándolas a modernizar sus ventas.`,
      
      church: `Saludos, vi que ${businessName}${locationText}.\n\nSoy de System-137 y trabajamos con instituciones religiosas mejorando su comunicación con la comunidad.`,
      
      school: `Buenos días, vi que ${businessName}${locationText}.${ratingsText}\n\nSoy de System-137 y trabajamos con instituciones educativas modernizando su comunicación digital.`,
      
      general: `Hola, vi su negocio ${businessName}${locationText}.${ratingsText}\n\nSoy de System-137 y ayudamos a negocios locales a crecer con tecnología.`
    };

    // Beneficios específicos por tipo de negocio
    const benefits: Record<string, string[]> = {
      hotel: [
        'Aumentar sus reservas con presencia digital profesional',
        'Automatizar confirmaciones de reservas (ahorra tiempo y reduce errores)',
        'Llegar a más turistas que buscan hospedaje online',
        'Responder consultas 24/7 incluso cuando están ocupados'
      ],
      
      restaurant: [
        'Recibir pedidos online directamente (sin comisiones de apps)',
        'Atraer más clientes con presencia en redes sociales',
        'Mostrar su menú actualizado siempre disponible',
        'Automatizar confirmaciones de pedidos y reservas'
      ],
      
      health: [
        'Reducir ausencias con recordatorios automáticos de citas',
        'Liberar tiempo del personal que confirma citas manualmente',
        'Mejorar la experiencia de sus pacientes',
        'Proyectar una imagen más profesional y moderna'
      ],
      
      store: [
        'Vender sus productos 24/7 sin necesidad de estar físicamente',
        'Llegar a más clientes con redes sociales bien gestionadas',
        'Recibir notificaciones instantáneas de cada pedido',
        'Competir con tiendas más grandes teniendo presencia digital'
      ],
      
      hardware: [
        'Mostrar su catálogo de productos online',
        'Recibir consultas y pedidos por WhatsApp de forma organizada',
        'Diferenciarse de la competencia con presencia digital',
        'Mantener informados a sus clientes sobre ofertas y nuevos productos'
      ],
      
      church: [
        'Comunicarse mejor con su comunidad',
        'Transmitir servicios religiosos en vivo',
        'Compartir mensajes y eventos fácilmente',
        'Mantener conectada a su congregación'
      ],
      
      school: [
        'Comunicación directa y rápida con padres de familia',
        'Proyectar una imagen institucional más profesional',
        'Compartir información importante de forma organizada',
        'Automatizar recordatorios de eventos y pagos'
      ],
      
      general: [
        'Ser más visible para clientes que buscan online',
        'Proyectar una imagen más profesional',
        'Automatizar tareas repetitivas y ahorrar tiempo',
        'Competir mejor con negocios más grandes'
      ]
    };

    const introduction = introductions[businessType] || introductions.general;
    const businessBenefits = benefits[businessType] || benefits.general;

    // Construir lista de beneficios
    const benefitsText = '\n\nLo que podemos hacer por ustedes:\n' + 
      businessBenefits.map(benefit => `✅ ${benefit}`).join('\n');

    // Soluciones recomendadas (sin precios)
    const packageInfo = this.packages[packageName.toLowerCase()];
    let solutionsText = `\n\n📦 Les recomendaría comenzar con nuestro paquete "${packageName}":\n${packageInfo.description}`;

    // Servicios de IA específicos (sin precios)
    if (services.length > 0) {
      const iaServicesText = services.map(service => {
        const iaProduct = Object.values(this.iaProducts).find(p => p.name === service);
        return iaProduct ? `   • ${service}: ${iaProduct.description}` : '';
      }).filter(s => s).join('\n');

      if (iaServicesText) {
        solutionsText += `\n\n🤖 Y complementarlo con automatizaciones ideales para su tipo de negocio:\n${iaServicesText}`;
      }
    }

    // Call to action sin presión
    const cta = `\n\n¿Les gustaría que conversemos? Puedo explicarles cómo funcionan estas soluciones y ver si tiene sentido para ${businessName}. Son solo 15 minutos, sin compromiso.\n\nSi les interesa, ¿cuándo tendrían un momento esta semana?\n\nSaludos,\nSystem-137 🚀\nTransformamos negocios con tecnología`;

    return `${introduction}${benefitsText}${solutionsText}${cta}`;
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
   * Extrae la ubicación más relevante de la dirección
   * Prioriza: Ciudad > Distrito > Provincia
   */
  private extractLocation(address?: string): string {
    if (!address || address === 'N/A') return '';

    // Limpiar la dirección
    const cleanAddress = address.trim();

    // Patrones comunes en direcciones peruanas
    // Buscar ciudad/distrito antes de la provincia
    const locationPatterns = [
      /,\s*([^,]+),\s*Peru$/i,           // "..., San Luis de Shuaro, Peru"
      /,\s*([^,]+),\s*\d+,\s*Peru$/i,    // "..., San Luis de Shuaro 12860, Peru"
      /([^,]+),\s*Peru$/i,                // "San Luis de Shuaro, Peru"
    ];

    for (const pattern of locationPatterns) {
      const match = cleanAddress.match(pattern);
      if (match && match[1]) {
        let location = match[1].trim();
        // Remover código postal si existe
        location = location.replace(/\s+\d{5,}$/, '');
        return location;
      }
    }

    // Si no coincide con patrones, buscar palabras clave de ubicación
    const parts = cleanAddress.split(',').map(p => p.trim());
    
    // Filtrar partes que parecen direcciones de calle
    const locationParts = parts.filter(part => 
      !part.match(/^(calle|jr|av|avenida|jirón)/i) &&
      !part.match(/^\d/) &&
      !part.toLowerCase().includes('peru') &&
      part.length > 3
    );

    if (locationParts.length > 0) {
      // Retornar la última parte válida (usualmente la ciudad/distrito)
      return locationParts[locationParts.length - 1].replace(/\s+\d{5,}$/, '');
    }

    return '';
  }

  /**
   * Genera texto sobre ratings si existen
   */
  private getRatingsText(lead: Lead): string {
    const totalRatings = parseInt(lead.TotalRatings || '0');
    const rating = parseFloat(lead.Rating || '0');

    if (totalRatings > 0 && rating > 0) {
      if (totalRatings >= 10) {
        return ` ¡Vi que tienen ${rating} estrellas con ${totalRatings} reseñas - excelente reputación!`;
      } else if (totalRatings >= 5) {
        return ` Vi que tienen ${rating} estrellas - ¡buena reputación!`;
      } else if (totalRatings > 0) {
        return ` Vi sus reseñas positivas`;
      }
    }

    return '';
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