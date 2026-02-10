
import React from 'react';

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300 custom-scrollbar rounded-none border border-rose-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-rose-900 tracking-tight">ขั้นตอนการใช้งาน</h2>
            <button onClick={onClose} className="p-3 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors text-rose-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="space-y-8">
            <section className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center font-black text-rose-600">1</div>
              <div>
                <h3 className="font-bold text-rose-900 mb-1">ท่าประเมิน (Adams Forward Bend)</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  ให้ผู้รับการประเมินยืนเท้าชิด ก้มตัวไปทางด้านหน้าจนหลังขนานกับพื้น ปล่อยแขนห้อยลงตามสบาย ฝ่ามือประกบกัน
                </p>
              </div>
            </section>

            <section className="flex gap-4">
               <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center font-black text-rose-600">2</div>
              <div>
                <h3 className="font-bold text-rose-900 mb-1">การวางอุปกรณ์</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  ถือโทรศัพท์ในแนว <strong>Landscape (แนวนอน)</strong> วางขอบด้านยาวทาบลงบนหลัง โดยให้ส่วนเว้าของเกจ (Notch) อยู่ตรงกับแนวกระดูกสันหลังพอดี
                </p>
              </div>
            </section>

            <section className="flex gap-4">
               <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center font-black text-rose-600">3</div>
              <div>
                <h3 className="font-bold text-rose-900 mb-1">การวัดและบันทึกค่า</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  เลื่อนอุปกรณ์ขึ้นลงตามแนวสันหลัง หาจุดที่มีองศาการหมุนสูงสุด (Peak of Rib Hump) แล้วกดปุ่ม <strong>Lock</strong> เพื่อบันทึกและดูผลวิเคราะห์
                </p>
              </div>
            </section>

            <div className="bg-rose-50 border border-rose-100 p-5">
              <p className="text-[10px] text-rose-800 font-bold leading-normal uppercase tracking-wider text-center">
                คำเตือน: แอปพลิเคชันนี้ใช้เพื่อการคัดกรองเบื้องต้นเท่านั้น ไม่สามารถใช้ทดแทนการวินิจฉัยโดยผู้เชี่ยวชาญได้
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 py-5 bg-rose-600 text-white font-black shadow-xl shadow-rose-200 active:scale-95 transition-all text-lg"
          >
            เริ่มใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
