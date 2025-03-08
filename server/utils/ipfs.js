import { create } from 'ipfs-http-client';
import { logger } from './logger.js';

const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

export const uploadToIPFS = async (file) => {
  try {
    const added = await ipfs.add(file);
    const url = `https://ipfs.io/ipfs/${added.path}`;
    return url;
  } catch (error) {
    logger.error('IPFS upload error:', error);
    throw new Error('Error uploading to IPFS');
  }
};

export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const data = JSON.stringify(metadata);
    const added = await ipfs.add(data);
    const url = `https://ipfs.io/ipfs/${added.path}`;
    return url;
  } catch (error) {
    logger.error('IPFS metadata upload error:', error);
    throw new Error('Error uploading metadata to IPFS');
  }
};

export default {
  uploadToIPFS,
  uploadMetadataToIPFS
};