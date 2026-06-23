import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Shield, Truck, Users, Zap } from 'lucide-react';

const VALUES = [
  {
    icon: Zap,
    title: 'Latest Technology',
    description: 'We stock the newest laptops, phones, and accessories from trusted global brands.',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Fast, reliable shipping to every governorate across Yemen.',
  },
  {
    icon: Shield,
    title: 'Secure Shopping',
    description: 'Bank transfer verification and protected checkout for peace of mind.',
  },
  {
    icon: Users,
    title: 'Local Expertise',
    description: 'A team that understands the Yemeni market and your unique needs.',
  },
];

export default function AboutPage() {
  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="max-w-3xl mb-14">
          <Badge variant="secondary" className="mb-3">About us</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            Technology for Yemen, by people who care
          </h1>
          <p className="text-lg text-white/50 mt-4 leading-relaxed">
            AURA TECH is Yemen&apos;s destination for premium technology — from flagship laptops and smartphones to peripherals and networking gear. We combine global product quality with local support you can count on.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6">
              <div className="h-11 w-11 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{description}</p>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-4">Our mission</h2>
              <p className="text-white/50 leading-relaxed mb-6">
                To make cutting-edge technology accessible across Yemen through a trustworthy, beautifully designed shopping experience — backed by responsive customer service and transparent pricing.
              </p>
              <ButtonLink href="/products">Explore products</ButtonLink>
            </CardContent>
            <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary-500/20 via-dark-900 to-secondary-500/10 flex items-center justify-center">
              <span className="text-8xl opacity-30">⚡</span>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
