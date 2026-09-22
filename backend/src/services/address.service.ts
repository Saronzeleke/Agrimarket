import { addressRepository, CreateAddressData, UpdateAddressData } from '../repositories/address.repository';
import { BadRequestError } from '../utils/errors';

export const addressService = {
  // Create new address
   
  async createAddress(userId: string, data: CreateAddressData) {
    // Validate required fields
    if (!data.fullName || !data.phone || !data.region || !data.zone || !data.woreda || !data.kebele) {
      throw new BadRequestError('Missing required address fields');
    }

    // If this is the user's first address, make it default
    const count = await addressRepository.count(userId);
    if (count === 0) {
      data.isDefault = true;
    }

    return addressRepository.create(userId, data);
  },

  // Get all user addresses
   
  async getAddresses(userId: string) {
    return addressRepository.findByUserId(userId);
  },
// Get address by ID
   
  async getAddress(id: string, userId: string) {
    return addressRepository.findById(id, userId);
  },

  // Get default address
  
  async getDefaultAddress(userId: string) {
    return addressRepository.findDefault(userId);
  },

 // Update address
 
  async updateAddress(id: string, userId: string, data: UpdateAddressData) {
    return addressRepository.update(id, userId, data);
  },

 
   // Set address as default
   
  async setDefaultAddress(id: string, userId: string) {
    return addressRepository.setDefault(id, userId);
  },

// Delete address

  async deleteAddress(id: string, userId: string) {
    // Check if this is the default address
    const address = await addressRepository.findById(id, userId);
    
    if (address.isDefault) {
      // Check if user has other addresses
      const addresses = await addressRepository.findByUserId(userId);
      if (addresses.length > 1) {
        // Set another address as default before deleting
        const nextDefault = addresses.find(a => a.id !== id);
        if (nextDefault) {
          await addressRepository.setDefault(nextDefault.id, userId);
        }
      }
    }

    return addressRepository.delete(id, userId);
  },

  // Validate Ethiopian address format
  validateAddressFormat(data: CreateAddressData | UpdateAddressData) {
    const errors: string[] = [];

    // Validate full name
    if (data.fullName && data.fullName.length < 3) {
      errors.push('Full name must be at least 3 characters');
    }

    // Validate phone (Ethiopian format)
    if (data.phone) {
      const phonePattern = /^(?:\+251|0)?[97]\d{8}$/;
      if (!phonePattern.test(data.phone.replace(/\s/g, ''))) {
        errors.push('Invalid Ethiopian phone number format');
      }
    }

    // Validate region (common Ethiopian regions)
    if (data.region) {
      const validRegions = [
        'addis ababa',
        'afar',
        'amhara',
        'benishangul-gumuz',
        'dire dawa',
        'gambela',
        'harari',
        'oromia',
        'sidama',
        'somali',
        'southern nations',
        'tigray',
      ];

      const regionLower = data.region.toLowerCase();
      const isValid = validRegions.some(r => regionLower.includes(r) || r.includes(regionLower));

      if (!isValid) {
        errors.push('Invalid Ethiopian region');
      }
    }

    if (errors.length > 0) {
      throw new BadRequestError('Address validation failed', errors);
    }
  },
};
