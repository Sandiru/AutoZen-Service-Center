
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Target, Users } from "lucide-react";
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">About AutoZen Services</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Dedicated to providing top-quality automotive care with transparency and efficiency. We are your trusted partner for all vehicle maintenance and repair needs.
        </p>
      </div>

      <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-xl">
        <Image
            src="https://picsum.photos/seed/teamwork/1200/600"
            alt="AutoZen Team Working"
            layout="fill"
            objectFit="cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white text-center px-4">Committed to Excellence in Auto Care</h2>
        </div>
      </div>


      <div className="grid md:grid-cols-3 gap-8">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="items-center text-center">
             <div className="p-3 rounded-full bg-accent/20 text-accent mb-4">
                <Building className="h-8 w-8" />
             </div>
            <CardTitle className="text-primary">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Founded with a passion for cars and customer service, AutoZen Services has grown into a leading auto care center known for its integrity and expertise. We started small, aiming to create a service experience built on trust and quality workmanship.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="items-center text-center">
             <div className="p-3 rounded-full bg-accent/20 text-accent mb-4">
                <Target className="h-8 w-8" />
             </div>
            <CardTitle className="text-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            To provide reliable, high-quality automotive services that ensure the safety and longevity of your vehicle. We strive to exceed expectations through advanced diagnostics, skilled technicians, and transparent communication.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="items-center text-center">
             <div className="p-3 rounded-full bg-accent/20 text-accent mb-4">
                <Users className="h-8 w-8" />
             </div>
            <CardTitle className="text-primary">Our Team</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Our certified technicians are the heart of AutoZen. With continuous training and a commitment to excellence, they possess the skills and knowledge to handle a wide range of automotive challenges, ensuring your vehicle is in capable hands.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
