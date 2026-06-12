import supabase from '../db/supabase.js';

export const logActivity = async (req, title, relatedEntity, status = 'info') => {
  const role = req.headers['x-user-role'] || 'admin';
  let performedBy = role === 'admin' ? 'Admin' : 'User';
  
  if (role === 'user' && req.headers['x-user-id']) {
    performedBy = `User ID: ${req.headers['x-user-id']}`;
  }

  const { error } = await supabase
    .from('activities')
    .insert([{ 
      title, 
      related_entity: relatedEntity, 
      performed_by: performedBy, 
      status 
    }]);
  
  if (error) {
    console.error("Failed to log activity to Supabase:", error.message);
  }
};
