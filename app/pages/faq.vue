<template>
  <div class="py-12 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h1>
      
      <div class="space-y-8">
        <div v-for="category in faqs" :key="category.name">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            {{ category.name }}
          </h2>
          <div class="space-y-6">
            <div v-for="faq in category.questions" :key="faq.q" class="prose prose-blue dark:prose-invert max-w-none">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ faq.q }}</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-16 p-8 bg-teal-50 dark:bg-teal-900/20 rounded-2xl text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still have questions?</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">We're here to help. Contact our support team anytime.</p>
        <UButton size="lg" to="/contact">Contact Support</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FAQ - iMentorsPro',
  description: 'Find answers to frequently asked questions about iMentorsPro.'
})

const faqs = [
  {
    name: 'General',
    questions: [
      {
        q: 'What is iMentorsPro?',
        a: 'iMentorsPro is an AI-powered platform that connects experienced mentors and coaches (“Expert Guides”) with founders and professionals who need clear, practical guidance. Our AI helps match you with the right people, streamline sessions, and track real progress.'
      },
      {
        q: 'Who is iMentorsPro for?',
        a: 'iMentorsPro is built for experienced mentors, coaches, operators, and professionals who want to share their expertise, support others’ growth, and earn from their knowledge—without spending time chasing clients.'
      },
      {
        q: 'Why should I join as an Expert Guide?',
        a: 'iMentorsPro helps you: Get matched with the right clients using AI, monetise your expertise on your own terms, manage sessions, availability, and payments in one place, and focus on impact, not admin.'
      }
    ]
  },
  {
    name: 'Becoming an Expert Guide',
    questions: [
      {
        q: 'How do I apply to become an Expert Guide?',
        a: 'Complete the application at https://www.imentorspro.com/auth/signup. Share your background, areas of expertise, and experience. Our team reviews all applications to maintain quality across the platform.'
      },
      {
        q: 'What qualifications do I need?',
        a: 'There are no strict academic requirements. We look for: Proven professional or leadership experience, coaching or mentoring background (formal or informal), and a strong track record of helping others grow or make better decisions.'
      },
      {
        q: 'How long does the review process take?',
        a: 'Most applications are reviewed within 5–7 business days. You’ll receive an email once a decision has been made.'
      }
    ]
  },
  {
    name: 'AI & Platform Features',
    questions: [
      {
        q: 'How does AI work on iMentorsPro?',
        a: 'Our AI helps: Match you with founders and professionals aligned to your expertise, surface insights about client goals and challenges, and track progress and outcomes across sessions. AI supports your work—it doesn’t replace your judgment or experience.'
      },
      {
        q: 'What tools are available to Expert Guides?',
        a: 'You’ll have access to: Smart scheduling and booking, session management tools, AI-assisted insights and summaries, progress tracking and analytics, and client feedback and performance metrics.'
      },
      {
        q: 'Can I control my availability and offerings?',
        a: 'Yes. You set your availability, session types, pricing, and whether you offer 1:1 or group sessions.'
      }
    ]
  },
  {
    name: 'Earnings & Payments',
    questions: [
      {
        q: 'How do I earn on iMentorsPro?',
        a: 'You earn per session or through structured packages you offer. All payments are handled securely through the platform.'
      },
      {
        q: 'When do I get paid?',
        a: 'Payouts are made weekly or monthly, depending on your selected preference.'
      },
      {
        q: 'Does iMentorsPro charge a fee?',
        a: 'Yes. We take a small commission per session to cover platform operations, AI infrastructure, and support. Full details are shared during onboarding.'
      }
    ]
  },
  {
    name: 'Growth & Support',
    questions: [
      {
        q: 'Will iMentorsPro help me grow my practice?',
        a: 'Yes. iMentorsPro connects you with a global pool of founders and professionals, helping you grow your reach without marketing or sales overhead.'
      },
      {
        q: 'What support is available to Expert Guides?',
        a: 'We offer: Platform onboarding, a detailed knowledge base, and dedicated support for technical or account issues.'
      },
      {
        q: 'Can I run group sessions or programmes?',
        a: 'Yes. You can offer both 1:1 guidance and group sessions, depending on your expertise and preferences.'
      }
    ]
  },
  {
    name: 'Security & Privacy',
    questions: [
      {
        q: 'How secure is my data?',
        a: 'iMentorsPro uses industry-standard encryption and secure systems to protect your data and communications.'
      },
      {
        q: 'Are my sessions confidential?',
        a: 'Yes. All sessions are private and protected under our confidentiality and privacy policies.'
      }
    ]
  },
  {
    name: 'Feedback & Quality',
    questions: [
      {
        q: 'How can I improve my visibility and rating?',
        a: 'Provide high-quality guidance, communicate clearly, and support measurable progress. Positive feedback improves your visibility on the platform.'
      },
      {
        q: 'Can I share feedback about iMentorsPro?',
        a: 'Absolutely. We actively welcome feedback to improve the platform for Expert Guides and clients alike.'
      }
    ]
  }
]
</script>
