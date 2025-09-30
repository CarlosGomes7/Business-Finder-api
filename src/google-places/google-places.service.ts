import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GooglePlaceDetails, GooglePlaceResult } from 'src/interfaces/google-places.interface';

@Injectable()
export class GooglePlacesService {
    private apiKey: string;
    private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY') || '';        
        
        if (!this.apiKey) {
            throw new Error('GOOGLE_PLACES_API_KEY is required in environment variables');
        }
    }

    async searchNearbyPlaces(
        location: { lat: number; lng: number },
        radius: number = 5000,
        type: string = 'establishment',
        maxPages: number = 3
    ): Promise<GooglePlaceResult[]> {
        try {
            let allResults: GooglePlaceResult[] = [];
            let nextPageToken: string | undefined = undefined;
            let page = 0;
            do {
                const params: any = {
                    location: `${location.lat},${location.lng}`,
                    radius,
                    type,
                    key: this.apiKey,
                };
                if (nextPageToken) {
                    params.pagetoken = nextPageToken;
                    // Google recomienda esperar unos segundos antes de usar el next_page_token
                    await new Promise(res => setTimeout(res, 2000));
                }
                const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, { params });
                if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                    throw new HttpException(
                        `Google Places API error: ${response.data.status}`,
                        HttpStatus.BAD_REQUEST
                    );
                }
                allResults = allResults.concat(response.data.results || []);
                nextPageToken = response.data.next_page_token;
                page++;
            } while (nextPageToken && page < maxPages);
            return allResults;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to search nearby places',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
    try {
        const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,geometry,types,business_status',
        key: this.apiKey,
        },
        });

        if (response.data.status !== 'OK') {
        throw new HttpException(
            `Google Places API error: ${response.data.status}`,
            HttpStatus.BAD_REQUEST
        );
        }

        return response.data.result;
    } catch (error) {
        if (error instanceof HttpException) {
        throw error;
        }
        throw new HttpException(
        'Failed to get place details',
        HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
    }
}
