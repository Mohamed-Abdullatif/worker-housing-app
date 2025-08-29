// Expo-compatible PDF service fallback
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

class ExpoPDFService {
    constructor() {
        this.isAvailable = true; // Expo modules are always available
    }

    async generateInvoicePDF(invoice) {
        try {
            // Create invoice HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            color: #333;
                            background-color: #fff;
                            direction: rtl;
                        }
                        .invoice-header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #2196F3;
                            padding-bottom: 15px;
                        }
                        .invoice-title {
                            font-size: 32px;
                            color: #2196F3;
                            margin-bottom: 10px;
                        }
                        .invoice-subtitle {
                            font-size: 18px;
                            color: #666;
                        }
                        .section {
                            margin: 20px 0;
                            padding: 15px;
                            border-radius: 8px;
                            background-color: #f8f9fa;
                        }
                        .section-title {
                            font-size: 20px;
                            color: #2196F3;
                            margin-bottom: 15px;
                            border-bottom: 1px solid #dee2e6;
                            padding-bottom: 5px;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                            font-size: 16px;
                        }
                        .amount {
                            font-size: 28px;
                            color: #2196F3;
                            text-align: center;
                            margin: 20px 0;
                            padding: 10px;
                            background-color: #e3f2fd;
                            border-radius: 8px;
                        }
                        .status {
                            display: inline-block;
                            padding: 8px 16px;
                            border-radius: 4px;
                            font-weight: bold;
                            text-align: center;
                        }
                        .status-paid {
                            background-color: #4CAF50;
                            color: white;
                        }
                        .status-pending {
                            background-color: #FFC107;
                            color: black;
                        }
                        .items-list {
                            list-style-type: none;
                            padding: 0;
                        }
                        .item {
                            padding: 8px;
                            margin: 4px 0;
                            background-color: #fff;
                            border-radius: 4px;
                            border: 1px solid #dee2e6;
                        }
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                            border-top: 1px solid #dee2e6;
                            padding-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <h1 class="invoice-title">فاتورة إيجار</h1>
                        <p class="invoice-subtitle">نظام إدارة السكن</p>
                    </div>

                    <div class="section">
                        <h2 class="section-title">معلومات الفاتورة</h2>
                        <div class="detail-row">
                            <span><strong>رقم الغرفة:</strong></span>
                            <span>${invoice.roomNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>الشهر:</strong></span>
                            <span>${invoice.month || 'غير محدد'}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>تاريخ الإصدار:</strong></span>
                            <span>${new Date().toLocaleDateString('ar-SA')}</span>
                        </div>
                    </div>

                    <div class="amount">
                        <strong>المبلغ الإجمالي:</strong> ${invoice.amount} ريال
                    </div>

                    <div class="section">
                        <h2 class="section-title">حالة الدفع</h2>
                        <div style="text-align: center;">
                            <span class="status ${invoice.status === 'paid' ? 'status-paid' : 'status-pending'}">
                                ${invoice.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                            </span>
                        </div>
                    </div>

                    <div class="section">
                        <h2 class="section-title">تفاصيل البنود</h2>
                        <ul class="items-list">
                            ${(invoice.items || ['إيجار شهري', 'كهرباء', 'مياه']).map(item => `<li class="item">• ${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="footer">
                        <p>شكراً لكم - نظام إدارة السكن</p>
                        <p>تم إصدار هذه الفاتورة بتاريخ ${new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                </body>
                </html>
            `;

            // Generate PDF using Expo Print
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });

            console.log('PDF generated using Expo Print:', uri);
            return uri;

        } catch (error) {
            console.error('Error generating PDF with Expo Print:', error);
            throw error;
        }
    }

    async sharePDF(uri, filename = 'invoice.pdf') {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    dialogTitle: 'Share Invoice PDF',
                    mimeType: 'application/pdf'
                });
                return { success: true };
            } else {
                console.log('Sharing not available');
                return { success: false, error: 'Sharing not available on this device' };
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            return { success: false, error: error.message };
        }
    }

    async downloadPDF(url, filename) {
        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                url,
                FileSystem.documentDirectory + filename + '.pdf'
            );

            const { uri } = await downloadResumable.downloadAsync();
            console.log('PDF downloaded to:', uri);

            return {
                success: true,
                filePath: uri
            };
        } catch (error) {
            console.error('Error downloading PDF:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getFilePath(filename) {
        return FileSystem.documentDirectory + filename + '.pdf';
    }
}

export default new ExpoPDFService();
