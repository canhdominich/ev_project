import ServiceCenter from '../models/serviceCenter.js';

export const getAllServiceCenters = async (req, res) => {
  try {
    const serviceCenters = await ServiceCenter.findAll();
    res.json(serviceCenters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getServiceCenterById = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByPk(req.params.id);
    if (!serviceCenter) return res.status(404).json({ message: 'Service center not found' });
    res.json(serviceCenter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createServiceCenter = async (req, res) => {
  try {
    const created = await ServiceCenter.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByPk(req.params.id);
    if (!serviceCenter) return res.status(404).json({ message: 'Service center not found' });

    await serviceCenter.update(req.body);
    res.json(serviceCenter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByPk(req.params.id);
    if (!serviceCenter) return res.status(404).json({ message: 'Service center not found' });

    await serviceCenter.destroy();
    res.json({ message: 'Service center deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


