import API from './api';

export const createFamily = async (familyData) => {
  return await API.post('/families', familyData);
};

export const fetchFamilyById = async (id) => {
  return await API.get(`/families/${id}`);
};

export const addFamilyMember = async (familyId, memberData) => {
  return await API.post(`/families/${familyId}/members`, memberData);
};

export const removeFamilyMember = async (familyId, userId) => {
  return await API.delete(`/families/${familyId}/members/${userId}`);
};

export const fetchFamilyDashboard = async (familyId) => {
  return await API.get(`/families/${familyId}/dashboard`);
};

export const fetchFamilyRecommendations = async (familyId) => {
  return await API.get(`/families/${familyId}/recommendations`);
};
