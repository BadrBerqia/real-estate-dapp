package com.realestate.property.service;

import com.realestate.property.dto.PropertyRequest;
import com.realestate.property.dto.PropertyResponse;

import java.util.List;

public interface PropertyService {
    PropertyResponse createProperty(PropertyRequest propertyRequest);

    List<PropertyResponse> getAllProperties();

    PropertyResponse getPropertyById(Long id);

    List<PropertyResponse> getPropertiesByOwner(String ownerAddress);

    void deleteProperty(Long id);
    // Add other methods as needed, e.g., update
}
