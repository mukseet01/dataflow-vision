
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Check, FileText, LucideIcon, SparklesIcon } from "lucide-react";

// Feature component
interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Feature = ({ icon: Icon, title, description }: FeatureProps) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="rounded-full bg-primary/10 p-3 mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Pricing tier component
interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const PricingTier = ({ name, price, description, features, highlighted = false }: PricingTierProps) => (
  <Card className={`flex flex-col border ${highlighted ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border'}`}>
    <CardContent className="flex flex-col flex-1 p-6">
      <div className="flex-1">
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="mt-4 mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Custom' && <span className="text-muted-foreground ml-2">/month</span>}
        </div>
        <p className="text-muted-foreground mb-4">{description}</p>
        <ul className="space-y-2 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button variant={highlighted ? "default" : "outline"} className="w-full mt-auto">
        {highlighted ? 'Get started' : 'Choose plan'}
      </Button>
    </CardContent>
  </Card>
);

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
              DS
            </div>
            <span className="font-semibold text-xl">DataSplend</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How it Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:py-32 bg-gradient-to-b from-background to-secondary/40">
        <div className="container flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              AI-Powered Data Entry &<br />Analysis Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automate your data entry processes and unlock powerful insights with our AI-driven data analysis platform.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                <SparklesIcon className="h-5 w-5" />
                Get Started for Free
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Request a Demo
            </Button>
          </div>
          <div className="w-full max-w-5xl overflow-hidden rounded-xl border shadow-2xl">
            <img
              src="https://placehold.co/1200x700/e2f3ff/333333?text=DataSplend+Dashboard"
              alt="DataSplend Dashboard"
              className="w-full aspect-video object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Powerful Features to Transform Your Data Workflow
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform offers everything you need to automate data entry and gain valuable insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon={FileText}
              title="AI Data Extraction"
              description="Automatically extract data from documents, forms, and images with high accuracy using our advanced AI algorithms."
            />
            <Feature
              icon={SparklesIcon}
              title="Smart Data Processing"
              description="Process and clean your data with intelligent automation that learns from your corrections and improves over time."
            />
            <Feature
              icon={BarChart3}
              title="Advanced Analytics"
              description="Generate insightful reports and visualizations to help you make data-driven decisions for your business."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 md:px-6 bg-secondary/30">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              How DataSplend Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our simple three-step process makes data entry and analysis effortless.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 text-center">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Data</h3>
              <p className="text-muted-foreground">
                Upload documents, forms, or connect to your existing data sources through our simple interface.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 text-center">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-muted-foreground">
                Our AI automatically extracts, processes, and organizes your data with minimal manual intervention.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 text-center">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Insights</h3>
              <p className="text-muted-foreground">
                Access powerful analytics and visualizations to gain actionable insights from your processed data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-6">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs and scale as you grow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingTier
              name="Starter"
              price="$49"
              description="Perfect for small businesses and individuals."
              features={[
                "AI data extraction from PDFs & images",
                "Up to 500 documents per month",
                "Basic analytics and reports",
                "3 user accounts",
                "Email support"
              ]}
            />
            <PricingTier
              name="Professional"
              price="$99"
              description="Ideal for growing businesses with more data needs."
              features={[
                "All Starter features",
                "Up to 2,000 documents per month",
                "Advanced analytics and custom reports",
                "10 user accounts",
                "Template creation",
                "Priority support"
              ]}
              highlighted={true}
            />
            <PricingTier
              name="Enterprise"
              price="Custom"
              description="For organizations with large-scale data requirements."
              features={[
                "All Professional features",
                "Unlimited documents",
                "Custom AI model training",
                "Unlimited user accounts",
                "API access",
                "Dedicated account manager",
                "SSO & advanced security"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Transform Your Data Workflow?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of businesses using DataSplend to automate data entry and unlock powerful insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg">Get Started for Free</Button>
              </Link>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
                  DS
                </div>
                <span className="font-semibold text-xl">DataSplend</span>
              </div>
              <p className="text-muted-foreground mb-4">
                AI-powered data entry automation and data analysis platform.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Security</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DataSplend. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
