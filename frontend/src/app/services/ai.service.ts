import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PriceRequest {
  surface: number;
  rooms: number;
  location_score: number;
  distance_center: number;
  season_index: number;
}

export interface PriceResponse {
  suggested_price: number;
  currency: string;
  input: PriceRequest;
}

export interface RiskRequest {
  late_payments: number;
  disputes: number;
  rental_duration: number;
}

export interface RiskResponse {
  risk_score: number;
  risk_level: string;
  input: RiskRequest;
}

export interface RecommendRequest {
  price: number;
  surface: number;
  rooms: number;
  location_score: number;
  lifestyle_score: number;
}

export interface RecommendResponse {
  recommended_cluster: number;
  cluster_name: string;
  input: RecommendRequest;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://35.192.0.248:30081/api/users';
  constructor(private http: HttpClient) {}

  predictPrice(data: PriceRequest): Observable<PriceResponse> {
    return this.http.post<PriceResponse>(`${this.apiUrl}/predict/price`, data);
  }

  predictRisk(data: RiskRequest): Observable<RiskResponse> {
    return this.http.post<RiskResponse>(`${this.apiUrl}/predict/risk`, data);
  }

  recommend(data: RecommendRequest): Observable<RecommendResponse> {
    return this.http.post<RecommendResponse>(`${this.apiUrl}/recommend`, data);
  }
}