import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GooglePlacesService } from 'src/google-places/google-places.service';
import { SearchBusinessDto } from './dto/search-business.dto/search-business.dto';
import { Business, SearchResults } from 'src/interfaces/business.interface';
import { GooglePlaceResult } from 'src/interfaces/google-places.interface';

@Injectable()
export class BusinessesService {
    constructor(private googlePlacesService: GooglePlacesService) {}

    private hasWebsite(place: any): boolean {
        return place.website && place.website.trim() !== '';
    }

    private removeDuplicates(businesses: any[]): any[] {
        return businesses.filter((business, index, self) => 
            index === self.findIndex(b => b.place_id === business.place_id)
        );
    }

    async searchBusinesses(searchDto: SearchBusinessDto): Promise<SearchResults> {
    try {
        console.log('searchBusinesses - body recibido:', JSON.stringify(searchDto));
        let allBusinesses: GooglePlaceResult[] = [];

        // Buscar diferentes tipos de negocios
        for (const type of searchDto.businessTypes) {
            console.log('Buscando negocios tipo:', type);
            const places = await this.googlePlacesService.searchNearbyPlaces(
                searchDto.location,
                searchDto.radius,
                type,
                searchDto.maxPages ?? 3
            );
            console.log(`Negocios encontrados para tipo ${type}:`, places.length);
            allBusinesses = allBusinesses.concat(places);
        }

        // Remover duplicados
        const uniqueBusinesses = this.removeDuplicates(allBusinesses);
        console.log('Negocios únicos tras remover duplicados:', uniqueBusinesses.length);

        // Obtener detalles de cada negocio
        const businessesWithDetails = await Promise.allSettled(
            uniqueBusinesses.map(async (business) => {
                try {
                    const details = await this.googlePlacesService.getPlaceDetails(business.place_id);
                    console.log(`Detalles obtenidos para ${business.name}`);
                    return {
                        id: business.place_id,
                        name: details.name,
                        address: details.formatted_address,
                        phone: details.formatted_phone_number,
                        website: details.website,
                        rating: details.rating,
                        totalRatings: details.user_ratings_total,
                        businessStatus: details.business_status,
                        types: details.types,
                        location: details.geometry?.location,
                        hasWebsite: this.hasWebsite(details),
                        openingHours: details.opening_hours?.weekday_text || [],
                    } as Business;
                } catch (error) {
                    console.error(`Error obteniendo detalles para ${business.name}:`, error);
                    return null;
                }
            })
        );

        // Filtrar resultados válidos
        const validBusinesses = businessesWithDetails
            .filter((result) => result.status === 'fulfilled' && result.value !== null)
            .map((result: any) => result.value)
            .filter((business) => business.businessStatus !== 'CLOSED_PERMANENTLY');

        // Separar negocios con y sin página web
        const businessesWithoutWebsite = validBusinesses.filter(business => !business.hasWebsite);
        const businessesWithWebsite = validBusinesses.filter(business => business.hasWebsite);

        console.log('Negocios válidos:', validBusinesses.length);
        console.log('Negocios sin web:', businessesWithoutWebsite.length);
        console.log('Negocios con web:', businessesWithWebsite.length);

        return {
            total: validBusinesses.length,
            withoutWebsite: businessesWithoutWebsite.length,
            withWebsite: businessesWithWebsite.length,
            businesses: {
                withoutWebsite: businessesWithoutWebsite,
                withWebsite: businessesWithWebsite,
                all: validBusinesses,
            },
        };
    } catch (error) {
        console.error('Error general en searchBusinesses:', error);
        throw new HttpException(
            'Failed to search businesses',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
    }

    getBusinessTypes() {
        return [
            { value: 'restaurant', label: 'Restaurantes' },
            { value: 'store', label: 'Tiendas' },
            { value: 'beauty_salon', label: 'Salones de Belleza' },
            { value: 'gym', label: 'Gimnasios' },
            { value: 'car_repair', label: 'Talleres Mecánicos' },
            { value: 'clothing_store', label: 'Tiendas de Ropa' },
            { value: 'bakery', label: 'Panaderías' },
            { value: 'pharmacy', label: 'Farmacias' },
            { value: 'dentist', label: 'Dentistas' },
            { value: 'lawyer', label: 'Abogados' },
            { value: 'real_estate_agency', label: 'Inmobiliarias' },
            { value: 'establishment', label: 'Todos los Establecimientos' },
        ];
    }

    convertToCSV(businesses: Business[]): string {
    const headers = ['Name', 'Address', 'Phone', 'Website', 'Rating', 'Total Ratings', 'Types'];
    const rows = businesses.map(business => [
        business.name,
        business.address,
        business.phone || 'N/A',
        business.website || 'No website',
        business.rating || 'N/A',
        business.totalRatings || 0,
        business.types.join(', '),
    ]);

    return [headers, ...rows]
        .map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        )
        .join('\n');
    }
}
