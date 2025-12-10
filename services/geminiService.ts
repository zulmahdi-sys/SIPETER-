import { GoogleGenAI } from "@google/genai";
import { ServiceRequest, RequestStatus } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeMaintenanceData = async (requests: ServiceRequest[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment variable.";
  }

  // Filter for active issues to send to the AI
  const activeRequests = requests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.IN_PROGRESS);

  if (activeRequests.length === 0) {
    return "Tidak ada permintaan aktif untuk dianalisis saat ini.";
  }

  const prompt = `
    Bertindaklah sebagai Manajer Fasilitas Senior. Analisis data permintaan pemeliharaan berikut (format JSON) dan berikan ringkasan eksekutif singkat (maksimal 3 paragraf).
    
    Data: ${JSON.stringify(activeRequests.map(r => ({ category: r.category, desc: r.description, priority: r.priority })))}

    Tugas:
    1. Identifikasi pola kritis (misalnya, apakah banyak kerusakan AC sekaligus?).
    2. Sarankan prioritas pengerjaan berdasarkan kategori dan urgensi.
    3. Berikan saran alokasi sumber daya.
    
    Gunakan Bahasa Indonesia yang formal dan profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Gagal mendapatkan analisis dari AI.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi layanan AI. Silakan coba lagi nanti.";
  }
};
