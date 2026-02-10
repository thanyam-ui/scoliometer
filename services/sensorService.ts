
export class SensorService {
  static async requestPermission(): Promise<boolean> {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        return permissionState === 'granted';
      } catch (error) {
        console.error('Error requesting orientation permission:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * คำนวณองศาจากแรงโน้มถ่วง (Gravity) สำหรับความแม่นยำสูงสุด
   * ใช้สูตร atan2(x, sqrt(y^2 + z^2)) เพื่อหาความเอียงของแกนยาวเทียบกับแนวระนาบ
   */
  static calculateFromGravity(x: number, y: number, z: number, orientation: 'portrait' | 'landscape'): number {
    let angle = 0;
    if (orientation === 'landscape') {
      // ในแนวนอน แกน X คือแนวขวางของโทรศัพท์ 
      // การหาความเอียงของแนวขวาง (Long edge) เทียบกับแรงโน้มถ่วง
      angle = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
    } else {
      // ในแนวตั้ง แกน Y คือแนวตั้งของโทรศัพท์
      angle = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
    }
    // ส่งค่าดิบ ไม่ปัดเศษ
    return angle;
  }

  static calculateATR(beta: number | null, gamma: number | null, orientation: 'portrait' | 'landscape'): number {
    const b = beta || 0;
    const g = gamma || 0;
    // ใช้ค่าจาก DeviceOrientation ในกรณีที่ Accelerometer ไม่ทำงาน
    return (orientation === 'landscape') ? b : g;
  }
}
