// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RealEstateRental - Decentralized Property Rental Platform
/// @notice Allows property listing, rental with date-based bookings, and cancellation
/// @dev Supports multiple non-overlapping rentals per property

contract RealEstateRental {
    
    // ============ Structs ============
    
    struct Property {
        uint256 id;
        address owner;
        string title;
        string description;
        string location;
        uint256 pricePerDay;
        uint256 deposit;
        bool isActive; // Property exists and is listed
        uint256[] rentalIds;
    }
    
    struct RentalAgreement {
        uint256 id;
        uint256 propertyId;
        address tenant;
        uint256 startDate;
        uint256 endDate;
        uint256 totalPrice;
        uint256 deposit;
        RentalStatus status;
    }
    
    enum RentalStatus {
        Active,
        Completed,
        Cancelled
    }
    
    // ============ State Variables ============
    
    uint256 private propertyCounter;
    uint256 private rentalCounter;
    
    mapping(uint256 => Property) public properties;
    mapping(uint256 => RentalAgreement) public rentals;
    mapping(address => uint256[]) private userProperties;
    mapping(address => uint256[]) private userRentals;
    
    uint256[] private allPropertyIds;
    
    // ============ Events ============
    
    event PropertyListed(uint256 indexed propertyId, address indexed owner, string title, uint256 pricePerDay);
    event PropertyUpdated(uint256 indexed propertyId, uint256 pricePerDay, uint256 deposit);
    event PropertyDeactivated(uint256 indexed propertyId);
    event RentalCreated(uint256 indexed rentalId, uint256 indexed propertyId, address indexed tenant, uint256 startDate, uint256 endDate);
    event RentalCompleted(uint256 indexed rentalId, address indexed tenant);
    event RentalCancelled(uint256 indexed rentalId, address indexed cancelledBy, uint256 refundAmount);
    
    // ============ Modifiers ============
    
    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Not property owner");
        _;
    }
    
    modifier propertyExists(uint256 _propertyId) {
        require(properties[_propertyId].id != 0, "Property does not exist");
        _;
    }
    
    modifier rentalExists(uint256 _rentalId) {
        require(rentals[_rentalId].id != 0, "Rental does not exist");
        _;
    }
    
    // ============ Property Functions ============
    
    /// @notice List a new property for rental
    /// @param _title Property title
    /// @param _description Property description
    /// @param _location Property location
    /// @param _pricePerDay Daily rental price in wei
    /// @param _deposit Security deposit in wei
    /// @return propertyId The ID of the newly created property
    function listProperty(
        string memory _title,
        string memory _description,
        string memory _location,
        uint256 _pricePerDay,
        uint256 _deposit
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_location).length > 0, "Location required");
        require(_pricePerDay > 0, "Price must be greater than 0");
        
        propertyCounter++;
        uint256 newPropertyId = propertyCounter;
        
        Property storage newProperty = properties[newPropertyId];
        newProperty.id = newPropertyId;
        newProperty.owner = msg.sender;
        newProperty.title = _title;
        newProperty.description = _description;
        newProperty.location = _location;
        newProperty.pricePerDay = _pricePerDay;
        newProperty.deposit = _deposit;
        newProperty.isActive = true;
        
        userProperties[msg.sender].push(newPropertyId);
        allPropertyIds.push(newPropertyId);
        
        emit PropertyListed(newPropertyId, msg.sender, _title, _pricePerDay);
        
        return newPropertyId;
    }
    
    /// @notice Get all active properties (available for viewing/booking)
    /// @return Array of all active properties
    function getAvailableProperties() external view returns (Property[] memory) {
        uint256 activeCount = 0;
        
        // Count active properties
        for (uint256 i = 0; i < allPropertyIds.length; i++) {
            if (properties[allPropertyIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active properties
        Property[] memory activeProperties = new Property[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allPropertyIds.length; i++) {
            uint256 propId = allPropertyIds[i];
            if (properties[propId].isActive) {
                activeProperties[index] = properties[propId];
                index++;
            }
        }
        
        return activeProperties;
    }
    
    /// @notice Get a specific property by ID
    /// @param _propertyId The property ID
    /// @return The property details
    function getProperty(uint256 _propertyId) external view propertyExists(_propertyId) returns (Property memory) {
        return properties[_propertyId];
    }
    
    /// @notice Get all properties owned by a user
    /// @param _user The user address
    /// @return Array of property IDs
    function getUserProperties(address _user) external view returns (uint256[] memory) {
        return userProperties[_user];
    }
    
    // ============ Rental Functions ============
    
    /// @notice Rent a property for specified dates
    /// @param _propertyId The property to rent
    /// @param _startDate Start date (unix timestamp)
    /// @param _endDate End date (unix timestamp)
    /// @return rentalId The ID of the new rental
    function rentProperty(
        uint256 _propertyId,
        uint256 _startDate,
        uint256 _endDate
    ) external payable propertyExists(_propertyId) returns (uint256) {
        Property storage property = properties[_propertyId];
        
        require(property.isActive, "Property not active");
        require(property.owner != msg.sender, "Cannot rent own property");
        require(_startDate >= block.timestamp, "Start date must be in future");
        require(_endDate > _startDate, "End date must be after start date");
        
        // Check for date conflicts with existing rentals
        require(!hasDateConflict(_propertyId, _startDate, _endDate), "Dates conflict with existing rental");
        
        // Calculate total price
        uint256 numberOfDays = (_endDate - _startDate) / 1 days;
        if (numberOfDays == 0) numberOfDays = 1;
        
        uint256 totalPrice = numberOfDays * property.pricePerDay;
        uint256 totalAmount = totalPrice + property.deposit;
        
        require(msg.value >= totalAmount, "Insufficient payment");
        
        // Create rental
        rentalCounter++;
        uint256 newRentalId = rentalCounter;
        
        RentalAgreement storage newRental = rentals[newRentalId];
        newRental.id = newRentalId;
        newRental.propertyId = _propertyId;
        newRental.tenant = msg.sender;
        newRental.startDate = _startDate;
        newRental.endDate = _endDate;
        newRental.totalPrice = totalPrice;
        newRental.deposit = property.deposit;
        newRental.status = RentalStatus.Active;
        
        property.rentalIds.push(newRentalId);
        userRentals[msg.sender].push(newRentalId);
        
        // Transfer rental payment to property owner
        payable(property.owner).transfer(totalPrice);
        
        // Refund excess payment
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }
        
        emit RentalCreated(newRentalId, _propertyId, msg.sender, _startDate, _endDate);
        
        return newRentalId;
    }
    
    /// @notice Check if dates conflict with existing active rentals
    /// @param _propertyId The property ID
    /// @param _startDate Proposed start date
    /// @param _endDate Proposed end date
    /// @return True if there is a conflict
    function hasDateConflict(
        uint256 _propertyId,
        uint256 _startDate,
        uint256 _endDate
    ) public view returns (bool) {
        Property storage property = properties[_propertyId];
        
        for (uint256 i = 0; i < property.rentalIds.length; i++) {
            RentalAgreement storage rental = rentals[property.rentalIds[i]];
            
            // Only check active rentals
            if (rental.status == RentalStatus.Active) {
                // Check for overlap: new rental starts before existing ends AND new rental ends after existing starts
                if (_startDate < rental.endDate && _endDate > rental.startDate) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /// @notice Get booked dates for a property (active rentals)
    /// @param _propertyId The property ID
    /// @return startDates Array of start dates
    /// @return endDates Array of end dates
    function getBookedDates(uint256 _propertyId) external view propertyExists(_propertyId) returns (
        uint256[] memory startDates,
        uint256[] memory endDates
    ) {
        Property storage property = properties[_propertyId];
        
        // Count active rentals
        uint256 activeCount = 0;
        for (uint256 i = 0; i < property.rentalIds.length; i++) {
            if (rentals[property.rentalIds[i]].status == RentalStatus.Active) {
                activeCount++;
            }
        }
        
        startDates = new uint256[](activeCount);
        endDates = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < property.rentalIds.length; i++) {
            RentalAgreement storage rental = rentals[property.rentalIds[i]];
            if (rental.status == RentalStatus.Active) {
                startDates[index] = rental.startDate;
                endDates[index] = rental.endDate;
                index++;
            }
        }
        
        return (startDates, endDates);
    }
    
    /// @notice Complete a rental (called by owner after rental period)
    /// @param _rentalId The rental ID
    function completeRental(uint256 _rentalId) external rentalExists(_rentalId) {
        RentalAgreement storage rental = rentals[_rentalId];
        Property storage property = properties[rental.propertyId];
        
        require(rental.status == RentalStatus.Active, "Rental not active");
        require(
            msg.sender == property.owner || msg.sender == rental.tenant,
            "Not authorized"
        );
        require(block.timestamp >= rental.endDate, "Rental period not ended");
        
        rental.status = RentalStatus.Completed;
        
        // Return deposit to tenant
        if (rental.deposit > 0) {
            payable(rental.tenant).transfer(rental.deposit);
        }
        
        emit RentalCompleted(_rentalId, rental.tenant);
    }
    
    /// @notice Cancel a rental (with refund policy)
    /// @param _rentalId The rental ID
    function cancelRental(uint256 _rentalId) external rentalExists(_rentalId) {
        RentalAgreement storage rental = rentals[_rentalId];
        Property storage property = properties[rental.propertyId];
        
        require(rental.status == RentalStatus.Active, "Rental not active");
        require(
            msg.sender == property.owner || msg.sender == rental.tenant,
            "Not authorized"
        );
        
        rental.status = RentalStatus.Cancelled;
        
        uint256 refundAmount = rental.deposit;
        
        // Refund policy: if cancelled before start date, refund deposit
        // If owner cancels, also refund the rental price
        if (msg.sender == property.owner) {
            // Owner cancels - full refund to tenant
            refundAmount += rental.totalPrice;
        }
        
        // If tenant cancels after start, they lose the rental price (already paid to owner)
        // But they get deposit back if cancelled before end
        if (block.timestamp < rental.startDate) {
            // Cancelled before start - tenant gets deposit back
            if (refundAmount > 0) {
                payable(rental.tenant).transfer(refundAmount);
            }
        } else {
            // Cancelled after start - deposit goes to owner as compensation
            if (rental.deposit > 0) {
                payable(property.owner).transfer(rental.deposit);
            }
        }
        
        emit RentalCancelled(_rentalId, msg.sender, refundAmount);
    }
    
    /// @notice Get rental agreement details
    /// @param _rentalId The rental ID
    /// @return The rental agreement
    function getRentalAgreement(uint256 _rentalId) external view rentalExists(_rentalId) returns (RentalAgreement memory) {
        return rentals[_rentalId];
    }
    
    /// @notice Get all rentals for a user (as tenant)
    /// @param _user The user address
    /// @return Array of rental IDs
    function getUserRentals(address _user) external view returns (uint256[] memory) {
        return userRentals[_user];
    }
    
    /// @notice Check if property is available for specific dates
    /// @param _propertyId The property ID
    /// @param _startDate Start date
    /// @param _endDate End date
    /// @return True if available
    function isAvailableForDates(
        uint256 _propertyId,
        uint256 _startDate,
        uint256 _endDate
    ) external view propertyExists(_propertyId) returns (bool) {
        return properties[_propertyId].isActive && !hasDateConflict(_propertyId, _startDate, _endDate);
    }
}