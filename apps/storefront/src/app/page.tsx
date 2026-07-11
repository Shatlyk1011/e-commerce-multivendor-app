
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowRight, Settings, Plus, ShoppingBag, Info } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink antialiased">
      {/* Hero Section */}
      <section className="bg-apple-surface-black text-apple-on-dark py-20 px-6 text-center select-none">
        <div className="max-w-4xl mx-auto">
          <p className="text-apple-tagline text-apple-primary-on-dark uppercase tracking-widest mb-4">
            Design System
          </p>
          <h1 className="text-apple-hero-display font-semibold mb-6 tracking-tight">
            Apple Design System Showcase
          </h1>
          <p className="text-apple-lead text-apple-body-muted max-w-2xl mx-auto mb-10">
            A premium, photography-first, minimalist presentation demonstrating our custom styled components, custom tokens, and layout guidelines.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="default" size="lg">
              Explore Components <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button variant="outline" size="lg">
              Read Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Button Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-b border-apple-hairline">
        <div className="mb-12">
          <h2 className="text-apple-display-lg mb-2">Typography & Buttons</h2>
          <p className="text-apple-body text-apple-ink-muted-48">
            Apple uses two main button grammars: primary blue pills and compact utility blocks, paired with micro-interactions.
          </p>
        </div>

        {/* Variants Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="bg-apple-canvas-parchment p-8 rounded-apple-lg border border-apple-hairline">
            <h3 className="text-apple-tagline mb-6">Button Variants</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Default / Primary</span>
                <Button variant="default">Buy Now</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Outline / Ghost Pill</span>
                <Button variant="outline">Learn more</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Secondary / Pearl Capsule</span>
                <Button variant="secondary">Add Options</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Dark Utility</span>
                <Button variant="darkUtility">Sign In</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Ghost</span>
                <Button variant="ghost">Cancel</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Destructive</span>
                <Button variant="destructive">Delete Item</Button>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-apple-hairline/50">
                <span className="text-apple-caption-strong">Link</span>
                <Button variant="link">View Specs</Button>
              </div>
            </div>
          </div>

          {/* Sizes Showcase */}
          <div className="bg-apple-canvas-parchment p-8 rounded-apple-lg border border-apple-hairline">
            <h3 className="text-apple-tagline mb-6">Button Sizes</h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-apple-fine-print text-apple-secondary-foreground mb-1">Large (lg) - Store Hero Actions</span>
                <div className="flex items-center gap-4">
                  <Button variant="default" size="lg">Store Hero</Button>
                  <Button variant="outline" size="lg">Store Specs</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-apple-fine-print text-apple-secondary-foreground mb-1">Default (default) - Product Actions</span>
                <div className="flex items-center gap-4">
                  <Button variant="default" size="default">Add to Bag</Button>
                  <Button variant="outline" size="default">More details</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-apple-fine-print text-apple-secondary-foreground mb-1">Small (sm) - Nav & Utility Actions</span>
                <div className="flex items-center gap-4">
                  <Button variant="darkUtility" size="sm">Bag</Button>
                  <Button variant="outline" size="sm">Select</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-apple-fine-print text-apple-secondary-foreground mb-1">Medium (md) - Pearl Capsule Actions</span>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" size="md">Add option</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-apple-fine-print text-apple-secondary-foreground mb-1">Extra Small (xs) - Inline Details</span>
                <div className="flex items-center gap-4">
                  <Button variant="default" size="xs">Edit</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-apple-fine-print text-apple-secondary-foreground mb-1">Circular & Icons (icon)</span>
                <div className="flex items-center gap-4">
                  <Button variant="iconCircular" size="icon">
                    <Plus className="size-5" />
                  </Button>
                  <Button variant="darkUtility" size="icon">
                    <ShoppingBag className="size-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="size-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Fields Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-apple-display-lg mb-2">Forms & Inputs</h2>
          <p className="text-apple-body text-apple-ink-muted-48">
            Tappable inputs with rounded-apple-pill geometry, clean borders, and clear typographic hierarchy.
          </p>
        </div>

        {/* Inputs Showcase */}
        <div className="bg-apple-canvas-parchment p-8 rounded-apple-lg border border-apple-hairline max-w-3xl mx-auto">
          <h3 className="text-apple-tagline mb-8">Input States & Labels</h3>
          <div className="flex flex-col gap-8">
            {/* Standard Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="search-input">Search Accessories</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-ink-muted-48">
                  <Search className="size-4" />
                </span>
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Search for cases, chargers, and more..."
                  className="pl-12"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-input">Email Address</Label>
              <Input
                id="email-input"
                type="email"
                placeholder="name@example.com"
              />
              <span className="text-apple-fine-print text-apple-ink-muted-48">
                We'll notify you when new products become available.
              </span>
            </div>

            {/* Invalid State */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="invalid-input">Zip Code</Label>
                <span className="text-apple-fine-print text-destructive flex items-center gap-1">
                  <Info className="size-3" /> Please enter a valid zip code.
                </span>
              </div>
              <Input
                id="invalid-input"
                type="text"
                placeholder="10001"
                aria-invalid="true"
                defaultValue="invalid-zip-code"
              />
            </div>

            {/* Disabled State */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="disabled-input" className="opacity-50">Locked Identifier</Label>
              <Input
                id="disabled-input"
                type="text"
                disabled
                defaultValue="apple-id-device-locked"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Spacing & Layout Rhythm */}
      <section className="bg-apple-canvas-parchment py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-apple-display-lg mb-6">Designed with Precision</h2>
          <p className="text-apple-body text-apple-ink mb-10 max-w-2xl mx-auto">
            This workspace implements the Apple Design System utilizing Tailwind CSS v4 variables. The alternating light and dark bands establish structural rhythm without requiring visible divider lines.
          </p>
          <div className="inline-flex items-center gap-4">
            <Button variant="default">Explore Store</Button>
            <Button variant="outline">Learn design specs</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-apple-canvas-parchment border-t border-apple-hairline py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-apple-fine-print text-apple-ink-muted-48">
            Copyright © 2026 Apple Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-apple-dense-link text-apple-ink hover:underline">Privacy Policy</a>
            <a href="#" className="text-apple-dense-link text-apple-ink hover:underline">Terms of Use</a>
            <a href="#" className="text-apple-dense-link text-apple-ink hover:underline">Sales Policy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
