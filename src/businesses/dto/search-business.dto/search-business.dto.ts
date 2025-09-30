import { IsNotEmpty, IsNumber, IsArray, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';


class LocationDto {
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    lng: number;
}


export class SearchBusinessDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsOptional()
    @IsNumber()
    @Min(100)
    @Max(50000)
    radius?: number = 5000;

    @IsOptional()
    @IsArray()
    businessTypes: string[] = ['establishment'];

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    maxPages?: number = 3;
}
