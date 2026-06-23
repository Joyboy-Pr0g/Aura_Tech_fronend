import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

const CONTACT_INFO = [
  { icon: MapPin, label: 'Address', value: "Haddah Street, Sana'a, Yemen" },
  { icon: Phone, label: 'Phone', value: '+967 777 000 000' },
  { icon: Mail, label: 'Email', value: 'hello@auratech.com' },
  { icon: Clock, label: 'Hours', value: 'Sat – Thu, 9:00 AM – 8:00 PM' },
];

export default function ContactPage() {
  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="max-w-3xl mb-10">
          <Badge variant="secondary" className="mb-3">Contact</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Get in touch</h1>
          <p className="text-white/50 mt-2">
            Questions about an order, product, or partnership? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
              <Card key={label} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-white mt-0.5">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>We typically respond within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us more..."
                    className="flex w-full rounded-xl border border-white/10 bg-dark-900/80 px-4 py-3 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 resize-none"
                  />
                </div>
                <Button type="button" className="w-full sm:w-auto">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
