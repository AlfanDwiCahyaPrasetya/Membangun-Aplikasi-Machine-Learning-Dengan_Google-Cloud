const Hapi = require('@hapi/hapi');
const loadModel = require('../services/loadModel');
const storeData = require('../services/storeData'); // Import fungsi storeData yang sudah Anda buat

const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
});

server.route({
    method: 'POST',
    path: '/predict',
    handler: async (request, h) => {
        // Ambil data input dari request
        const { data } = request.payload;

        // Memuat model
        const model = await loadModel();
        
        // Lakukan prediksi
        const prediction = await model.predict(data);  // Proses prediksi
        
        // Mengambil hasil prediksi
        const result = prediction.dataSync(); // Ambil hasil prediksi dari tensor
        
        // Menentukan ID yang unik untuk tiap prediksi (gunakan timestamp atau nanoid)
        const id = Date.now().toString(); // Menggunakan timestamp sebagai ID unik
        const suggestion = 'Some suggestion based on prediction'; // Saran berdasarkan hasil prediksi
        const createdAt = new Date().toISOString(); // Timestamp saat data dibuat

        // Data yang akan disimpan ke Firestore
        const dataToStore = {
            id,
            result: result.toString(),  // Convert result ke format yang sesuai (string)
            suggestion,
            createdAt,
        };

        // Simpan hasil prediksi ke Firestore
        await storeData(id, dataToStore);

        // Mengembalikan respons setelah penyimpanan
        return h.response({ success: true, message: 'Prediction saved to Firestore' }).code(200);
    },
});

const init = async () => {
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

init();
