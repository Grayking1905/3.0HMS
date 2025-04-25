import { DoctorList } from '@/components/doctors/doctor-list';
import { ChatInterface } from '@/components/chat/chat-interface';
import { SymptomChecker } from '@/components/ai/symptom-checker';
import { PrescriptionReader } from '@/components/ai/prescription-reader'; // Import PrescriptionReader
import { MedicineList } from '@/components/pharmacy/medicine-list';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, MessageSquare, BrainCircuit, Pill, FileScan } from 'lucide-react'; // Import FileScan icon

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Welcome to CureNova</h1>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8"> {/* Updated grid columns to 4 */}
          <TabsTrigger value="appointments">
            <Stethoscope className="mr-2 h-4 w-4" /> Book Appointment
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" /> Doctor Chat
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <BrainCircuit className="mr-2 h-4 w-4" /> AI Assistant
          </TabsTrigger>
          <TabsTrigger value="pharmacy"> {/* Added Pharmacy tab trigger */}
            <Pill className="mr-2 h-4 w-4" /> Pharmacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 text-primary" /> Find and Book Your Doctor
              </CardTitle>
              <CardDescription>Select a specialist and book your appointment in real-time.</CardDescription>
            </CardHeader>
            <CardContent>
              <DoctorList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 text-primary" /> Direct Doctor Communication
              </CardTitle>
              <CardDescription>Chat securely with your doctor for quick consultations.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant">
          {/* AI Assistant Section using nested Tabs */}
          <Tabs defaultValue="symptom-checker" className="w-full">
             <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="symptom-checker">
                   <BrainCircuit className="mr-2 h-4 w-4" /> Symptom Checker
                </TabsTrigger>
                <TabsTrigger value="prescription-reader">
                  <FileScan className="mr-2 h-4 w-4" /> Prescription Reader
                </TabsTrigger>
             </TabsList>

             <TabsContent value="symptom-checker">
                <Card className="shadow-md rounded-lg border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BrainCircuit className="mr-2 text-primary" /> AI Medical Assistant
                    </CardTitle>
                    <CardDescription>Check your symptoms and get basic health advice.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SymptomChecker />
                  </CardContent>
                </Card>
              </TabsContent>

             <TabsContent value="prescription-reader">
                <Card className="shadow-md rounded-lg border">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileScan className="mr-2 text-primary" /> AI Prescription Reader
                      </CardTitle>
                      <CardDescription>Upload an image of your prescription to extract the text.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PrescriptionReader />
                    </CardContent>
                </Card>
             </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="pharmacy"> {/* Added Pharmacy tab content */}
           <Card className="shadow-lg rounded-lg">
             <CardHeader>
               <CardTitle className="flex items-center">
                  <Pill className="mr-2 text-primary" /> Online Pharmacy
               </CardTitle>
               <CardDescription>Order medicines and health products online.</CardDescription>
             </CardHeader>
             <CardContent>
                <MedicineList />
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
