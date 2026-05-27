<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class FaceRecognitionService
{
    protected $pythonPath;
    protected $scriptPath;
    
    public function __construct()
    {
        // Sử dụng đường dẫn tuyệt đối đến Python trong venv
        $this->pythonPath = base_path('.venv/Scripts/python.exe');
        $this->scriptPath = base_path('python/verify_face.py');
    }
    
    /**
     * So sánh 2 ảnh khuôn mặt
     * @return array ['success' => bool, 'similarity' => float, 'message' => string]
     */
    public function verifyFaces($image1Path, $image2Path, $tolerance = 0.5)
    {
        try {
            // Đảm bảo đường dẫn tuyệt đối
            $fullPath1 = $this->getFullPath($image1Path);
            $fullPath2 = $this->getFullPath($image2Path);
            
            if (!file_exists($fullPath1)) {
                throw new \Exception("Không tìm thấy ảnh 1: $fullPath1");
            }
            if (!file_exists($fullPath2)) {
                throw new \Exception("Không tìm thấy ảnh 2: $fullPath2");
            }
            
            // Set environment variables để tránh lỗi random initialization
            $env = [
                'PYTHONHASHSEED' => '0',
                'PYTHONRANDOMSEED' => '0',
                'PYTHONLEGACYWINDOWSSTDIO' => 'utf-8'
            ];
            
            // Gọi Python script
            $command = [
                $this->pythonPath,
                $this->scriptPath,
                $fullPath1,
                $fullPath2,
                (string)$tolerance
            ];
            
            Log::info('Running command: ' . implode(' ', $command));
            
            $process = new Process($command);
            $process->setTimeout(30);
            $process->setEnv($env); // Set environment variables
            $process->run();
            
            // Lấy output
            $output = trim($process->getOutput());
            $error = trim($process->getErrorOutput());
            
            Log::info('Python output: ' . $output);
            if (!empty($error)) {
                Log::error('Python error: ' . $error);
            }
            
            if (!$process->isSuccessful()) {
                throw new \Exception("Process failed with exit code {$process->getExitCode()}. Error: $error");
            }
            
            // Parse output - script Python trả về số thập phân
            if (is_numeric($output)) {
                $similarity = (float)$output;
                return [
                    'success' => true,
                    'similarity' => $similarity,
                    'is_match' => $similarity >= $tolerance,
                    'message' => $similarity >= $tolerance ? 'Khuôn mặt khớp' : 'Khuôn mặt không khớp'
                ];
            } else {
                throw new \Exception("Invalid output from Python script: $output");
            }
            
        } catch (\Exception $e) {
            Log::error('Face recognition error: ' . $e->getMessage());
            return [
                'success' => false,
                'similarity' => 0,
                'is_match' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Kiểm tra ảnh base64 từ request
     */
    public function verifyWithBase64($base64Image, $avatarPath, $tolerance = 0.5)
    {
        $tempFile = null;
        try {
            // Lưu ảnh tạm
            $tempFile = $this->saveBase64ToTemp($base64Image);
            $result = $this->verifyFaces($tempFile, $avatarPath, $tolerance);
            
            return $result;
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'similarity' => 0,
                'is_match' => false,
                'message' => $e->getMessage()
            ];
        } finally {
            // Xóa ảnh tạm
            if ($tempFile && file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }
    
    /**
     * Lưu base64 thành file tạm
     */
    protected function saveBase64ToTemp($base64String)
    {
        // Xóa phần header nếu có
        if (str_contains($base64String, 'data:image')) {
            $base64String = preg_replace('#^data:image/\w+;base64,#i', '', $base64String);
        }
        
        $imageData = base64_decode($base64String);
        if ($imageData === false) {
            throw new \Exception('Invalid base64 string');
        }
        
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $tempFile = $tempDir . '/' . uniqid() . '_' . time() . '.jpg';
        file_put_contents($tempFile, $imageData);
        
        return $tempFile;
    }
    
    /**
     * Lấy đường dẫn đầy đủ
     */
    protected function getFullPath($path)
    {
        // Nếu đường dẫn đã là absolute path
        if (file_exists($path)) {
            return $path;
        }
        
        // Nếu đường dẫn liên quan đến storage
        if (strpos($path, 'avatars/') === 0 || 
            strpos($path, 'attendance/') === 0 ||
            strpos($path, 'temp/') === 0) {
            return Storage::disk('public')->path($path);
        }
        
        return $path;
    }
}