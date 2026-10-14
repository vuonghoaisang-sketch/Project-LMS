import api from '@/lib/axios';
import { Certificate } from '@/types/certificate';

export async function claimCertificate(
  courseId: number,
): Promise<{ certificate: Certificate; isNew: boolean }> {
  const response = await api.post(`/courses/${courseId}/certificate`);
  return response.data;
}

export async function getMyCertificates(): Promise<Certificate[]> {
  const response = await api.get('/my-certificates');
  return response.data.certificates;
}

export async function verifyCertificate(
  code: string,
): Promise<{ valid: boolean; certificate: Certificate }> {
  const response = await api.get(`/verify/${code}`);
  return response.data;
}

export function getCertificateDownloadUrl(courseId: number): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${apiUrl}/courses/${courseId}/certificate/download`;
}
