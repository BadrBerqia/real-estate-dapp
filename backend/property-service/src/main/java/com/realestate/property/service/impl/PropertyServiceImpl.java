package com.realestate.property.service.impl;

import com.realestate.property.dto.PropertyRequest;
import com.realestate.property.dto.PropertyResponse;
import com.realestate.property.model.Property;
import com.realestate.property.repository.PropertyRepository;
import com.realestate.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;

    @Override
    @Transactional
    public PropertyResponse createProperty(PropertyRequest propertyRequest) {
        // Implement manual mapping or use a mapper
        Property property = Property.builder()
                .title(propertyRequest.getTitle())
                .description(propertyRequest.getDescription())
                .location(propertyRequest.getLocation())
                .pricePerDay(propertyRequest.getPricePerDay())
                .ownerAddress(propertyRequest.getOwnerAddress())
                .imageUrl(propertyRequest.getImageUrl())
                .isAvailable(true) // Default to true
                .build();

        Property savedProperty = propertyRepository.save(property);
        return mapToResponse(savedProperty);
    }

    @Override
    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        return mapToResponse(property);
    }

    @Override
    public List<PropertyResponse> getPropertiesByOwner(String ownerAddress) {
        return propertyRepository.findByOwnerAddress(ownerAddress).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new RuntimeException("Property not found with id: " + id);
        }
        propertyRepository.deleteById(id);
    }

    private PropertyResponse mapToResponse(Property property) {
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .location(property.getLocation())
                .pricePerDay(property.getPricePerDay())
                .ownerAddress(property.getOwnerAddress())
                .isAvailable(property.getIsAvailable())
                .imageUrl(property.getImageUrl())
                .build();
    }
}
