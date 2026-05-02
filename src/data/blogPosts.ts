export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string; // markdown-ish, rendered as paragraphs
}

export const blogPosts: BlogPost[] = [
  {
    slug: "fixed-vs-adjustable-rate-mortgage",
    title: "Fixed vs Adjustable Rate Mortgage: Which Is Right for You?",
    excerpt:
      "Understand the key differences between fixed-rate and adjustable-rate mortgages and how to choose the right one.",
    date: "2026-04-15",
    readTime: "6 min read",
    content: `A fixed-rate mortgage locks in the same interest rate for the entire life of your loan, giving you predictable monthly payments for 15, 20, or 30 years. This stability makes budgeting easier and protects you from rising rates.

An adjustable-rate mortgage (ARM) starts with a lower introductory rate that adjusts periodically after an initial fixed period (commonly 5, 7, or 10 years). ARMs can save you money in the early years if you plan to move or refinance before the rate adjusts.

Choose a fixed-rate mortgage if you value long-term stability, plan to stay in your home for 7+ years, or believe interest rates will rise. Choose an ARM if you expect to move within a few years, anticipate higher future income, or current rates are unusually high.

Run both scenarios through a mortgage calculator to compare total interest paid over the time you actually expect to keep the loan — not just the full term.`,
  },
  {
    slug: "how-much-house-can-i-afford",
    title: "How Much House Can I Afford? The 28/36 Rule Explained",
    excerpt:
      "Learn the simple budgeting rule lenders use and how to calculate a realistic home price for your income.",
    date: "2026-04-08",
    readTime: "5 min read",
    content: `The 28/36 rule is a classic guideline: spend no more than 28% of your gross monthly income on housing costs (PITI), and no more than 36% on total debt payments including the mortgage.

For a $90,000 annual income ($7,500/month), that means roughly $2,100/month for housing and $2,700/month for all debts combined. With current rates around 6.5% on a 30-year loan, that supports a home price of approximately $310,000–$340,000 with 20% down.

Don't forget the hidden costs: property taxes, homeowners insurance, PMI (if down payment is under 20%), HOA fees, and ongoing maintenance averaging 1–3% of home value per year.

Use a mortgage calculator with PITI included to see your true monthly cost — not just principal and interest. Then leave room in your budget for emergencies and life.`,
  },
  {
    slug: "benefits-of-extra-mortgage-payments",
    title: "The Power of Extra Mortgage Payments",
    excerpt:
      "See how even $100 extra per month can shave years off your loan and save tens of thousands in interest.",
    date: "2026-03-29",
    readTime: "4 min read",
    content: `Adding just $100 extra to your monthly mortgage payment can dramatically change your loan's outcome. On a $320,000 loan at 6.5% over 30 years, an extra $100/month pays off the loan about 4 years early and saves roughly $55,000 in interest.

Bump that to $300 extra and you can shave nearly 9 years off the loan and save over $130,000. This works because every extra dollar goes directly to principal, reducing the balance interest is calculated on.

Strategies to consider: round up your payment to the nearest hundred, make one extra payment per year, or apply tax refunds and bonuses as lump-sum principal payments.

Confirm with your lender that extra payments apply to principal (not future interest) and that there are no prepayment penalties. Then plug the numbers into a mortgage calculator to see your personal savings.`,
  },
  {
    slug: "understanding-pmi-and-down-payments",
    title: "Understanding PMI and the 20% Down Payment Myth",
    excerpt:
      "PMI sounds scary, but it can actually help you buy sooner. Here's when it makes sense.",
    date: "2026-03-20",
    readTime: "5 min read",
    content: `Private Mortgage Insurance (PMI) is required on most conventional loans when your down payment is less than 20%. It typically costs 0.3% to 1.5% of the loan amount annually — about $80–$400/month on a $300,000 loan.

The "20% down" rule isn't a law. With home prices rising, waiting years to save 20% often costs more than just paying PMI for a few years. PMI automatically cancels once you reach 22% equity, and you can request removal at 20%.

Compare two scenarios: buying now with 5–10% down and PMI vs. waiting 3 years to save 20% while prices and rates may rise. Often, buying earlier wins despite the PMI cost.

Calculate both paths with a full PITI mortgage calculator to make a confident decision.`,
  },
];
