import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { HeroSection } from '../components/HeroSection';
import { CampusIssueUpdatesSection } from '../components/CampusIssueUpdatesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { CategoriesSection } from '../components/CategoriesSection';

export const LandingPage: React.FC = () => {
  return (
    <PublicLayout>
      <main>
        <HeroSection />
        <CampusIssueUpdatesSection />
        <HowItWorksSection />
        <CategoriesSection />
      </main>
    </PublicLayout>
  );
};

