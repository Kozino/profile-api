import express from 'express';
import { fetchGenderData, fetchAgeData, fetchNationalityData } from '../services/externalApiService.js';
import { getAgeGroup } from '../services/classificationService.js';
import { createProfile, findProfileByName, findProfileById, getAllProfiles, deleteProfile } from '../models/profile.js';

const router = express.Router();

// POST /api/profiles
router.post('/api/profiles', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name'
      });
    }
    
    const trimmedName = name.trim().toLowerCase();
    
    // Check if profile already exists
    const existingProfile = await findProfileByName(trimmedName);
    if (existingProfile) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: existingProfile
      });
    }
    
    // Fetch data from external APIs
    let genderData, ageData, nationalityData;
    
    try {
      [genderData, ageData, nationalityData] = await Promise.all([
        fetchGenderData(trimmedName),
        fetchAgeData(trimmedName),
        fetchNationalityData(trimmedName)
      ]);
    } catch (error) {
      const status = 502;
      let message = error.message;
      
      if (message.includes('Genderize')) {
        return res.status(status).json({ status: 'error', message });
      } else if (message.includes('Agify')) {
        return res.status(status).json({ status: 'error', message });
      } else if (message.includes('Nationalize')) {
        return res.status(status).json({ status: 'error', message });
      }
      throw error;
    }
    
    const ageGroup = getAgeGroup(ageData.age);
    
    const profileData = {
      name: trimmedName,
      gender: genderData.gender,
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age: ageData.age,
      age_group: ageGroup,
      country_id: nationalityData.country_id,
      country_probability: nationalityData.probability
    };
    
    const newProfile = await createProfile(profileData);
    
    res.status(201).json({
      status: 'success',
      data: newProfile
    });
  } catch (error) {
    console.error('Error in POST /api/profiles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// GET /api/profiles/:id
router.get('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await findProfileById(id);
    
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    console.error('Error in GET /api/profiles/:id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// GET /api/profiles
router.get('/api/profiles', async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;
    const filters = {};
    
    if (gender) filters.gender = gender;
    if (country_id) filters.country_id = country_id;
    if (age_group) filters.age_group = age_group;
    
    const profiles = await getAllProfiles(filters);
    
    res.status(200).json({
      status: 'success',
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Error in GET /api/profiles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// DELETE /api/profiles/:id
router.delete('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProfile(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /api/profiles/:id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

export default router;
