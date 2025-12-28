package com.realestate.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private BigDecimal pricePerDay;
    private String ownerAddress;
    private Boolean isAvailable;
    private String imageUrl;
}
