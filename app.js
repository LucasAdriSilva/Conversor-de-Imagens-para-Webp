const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Caminho da pasta contendo as imagens
const inputFolder = './img';
const outputFolder = './img_convertida';
const logFile = './conversion_log.txt';

// Variáveis para armazenar o tamanho total das imagens
let totalOriginalSize = 0;
let totalConvertedSize = 0;

// Cria a pasta de saída, se não existir
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

// Função para obter o tamanho do arquivo
const getFileSizeInKB = (filePath) => {
    const stats = fs.statSync(filePath);
    return stats.size / 1024; // Retorna o tamanho em KB
};

// Função para registrar o nome da imagem e os tamanhos antes e depois
const logConversion = (fileName, originalSize, convertedSize) => {
    const logMessage = `Imagem: ${fileName}\nTamanho original: ${originalSize.toFixed(2)} KB\nTamanho convertido: ${convertedSize.toFixed(2)} KB\n\n`;
    fs.appendFileSync(logFile, logMessage, (err) => {
        if (err) throw err;
    });
    console.log(`Informações registradas no log para ${fileName}`);
};

// Função para registrar o total de tamanhos no log
const logTotalSize = () => {
    const totalMessage = `Tamanho total original: ${totalOriginalSize.toFixed(2)} KB\nTamanho total convertido: ${totalConvertedSize.toFixed(2)} KB\n\n`;
    fs.appendFileSync(logFile, totalMessage, (err) => {
        if (err) throw err;
    });
    console.log('Tamanho total registrado no log.');
};

// Função para converter imagens para WebP
const convertToWebP = async (inputPath, outputPath, fileName) => {
    try {
        // Obtém o tamanho original da imagem
        const originalSize = getFileSizeInKB(inputPath);

        // Converte a imagem para WebP
        await sharp(inputPath)
            .webp({ quality: 100 })  // Qualidade da compressão
            .toFile(outputPath);

        // Obtém o tamanho da imagem convertida
        const convertedSize = getFileSizeInKB(outputPath);

        // Soma os tamanhos às variáveis totais
        totalOriginalSize += originalSize;
        totalConvertedSize += convertedSize;

        // Registra as informações no arquivo de log
        logConversion(fileName, originalSize, convertedSize);

        console.log(`Convertido: ${outputPath}`);
    } catch (err) {
        console.error(`Erro ao converter ${inputPath}:`, err);
    }
};

// Lê os arquivos da pasta de entrada
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        return console.error('Erro ao ler a pasta:', err);
    }

    let validFileCount = 0;
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

        // Verifica se o arquivo tem uma extensão de imagem válida
        if (validExtensions.includes(ext)) {
            const inputPath = path.join(inputFolder, file);
            const outputPath = path.join(outputFolder, `${path.basename(file, ext)}.webp`);

            validFileCount++;

            // Converte para WebP e registra as informações no log
            convertToWebP(inputPath, outputPath, file);
        }
    });

    // Após processar todos os arquivos, registra o total de tamanhos no log
    if (validFileCount > 0) {
        // Adiciona um delay para garantir que todas as conversões sejam concluídas
        setTimeout(logTotalSize, 1000);
    }
});
