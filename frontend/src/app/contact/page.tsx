
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We'd love to hear from you! Reach out with any questions, service inquiries, or feedback.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="text-accent" /> Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Contact Form */}
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your Email Address" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Message Subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." rows={5} />
              </div>
              <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90">
                <Mail className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </form>
             {/* TODO: Implement form submission logic */}
          </CardContent>
        </Card>

        {/* Contact Details Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">Our Contact Information</CardTitle>
            <CardDescription>Find us or give us a call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-accent/20 text-accent">
                 <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Address</h3>
                <p className="text-muted-foreground">123 Auto Care Drive,<br/> Mechanicville, CA 98765</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-accent/20 text-accent">
                 <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Phone</h3>
                <p className="text-muted-foreground">(123) 456-7890</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="p-3 rounded-full bg-accent/20 text-accent">
                 <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Email</h3>
                <p className="text-muted-foreground">service@autozen.com</p>
              </div>
            </div>
            {/* Optionally Add Map Placeholder */}
             <div className="mt-6">
                <h3 className="font-semibold text-primary mb-2">Find Us Here</h3>
                <div className="aspect-video bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
                    Map Placeholder
                    {/* TODO: Embed an actual map */}
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
