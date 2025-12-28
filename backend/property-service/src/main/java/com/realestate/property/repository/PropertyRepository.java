package com.realestate.property.repository;

import com.realestate.property.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOwnerAddress(String ownerAddress);
}
