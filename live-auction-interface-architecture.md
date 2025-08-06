# Live Auction Interface - Architectural Plan

This document outlines the architecture for the "Live Auction Interface" component, a real-time, mobile-first interface for live auctions.

## 1. Component Breakdown

The interface will be composed of the following React components:

*   **`LiveAuctionInterface` (Container):** The main container component that fetches initial auction data, establishes the Supabase Realtime connection, and manages the overall state of the auction.
    *   **`BidDisplay`:** Displays the current highest bid. The font size will be 36px as required.
    *   **`CountdownTimer`:** A circular, animated countdown timer showing the remaining time in the auction.
    *   **`QuickBidButtons`:** A set of buttons for placing quick bids (e.g., +100, +500, +1000 CHF).
    *   **`AutoBidModal`:** A modal dialog for setting up and managing auto-bidding rules.
    *   **`BidHistory`:** A live, scrolling list of all bids placed in the auction.
    *   **`AuctionStatusIndicator`:** Displays the current status of the auction (e.g., "Live", "Ending Soon", "Finished").

## 2. Directory Structure

The new components will be organized within the `components` directory as follows:

```
components/
└── auction/
    ├── LiveAuctionInterface.tsx
    ├── BidDisplay.tsx
    ├── CountdownTimer.tsx
    ├── QuickBidButtons.tsx
    ├── AutoBidModal.tsx
    ├── BidHistory.tsx
    ├── AuctionStatusIndicator.tsx
    └── hooks/
        ├── useAuctionRealtime.ts
        ├── useBiometricAuth.ts
        └── useRateLimiter.ts
```

## 3. Real-time Data Flow

Data will flow from Supabase Realtime to the components via a custom hook, `useAuctionRealtime`.

*   **Supabase Channel:** A single channel will be used for each auction, named `auction:<auction_id>`.
*   **Events:**
    *   `new_bid`: Triggered when a new bid is placed. The payload will contain the new bid amount and the bidder's information.
    *   `time_update`: Triggered periodically to update the remaining time in the auction.
    *   `auction_status_change`: Triggered when the auction status changes (e.g., from "Live" to "Ending Soon").
*   **Data Flow Diagram:**

    ```mermaid
    graph TD
        A[Supabase Realtime] -- new_bid, time_update, auction_status_change --> B(useAuctionRealtime Hook);
        B -- auctionState --> C(LiveAuctionInterface);
        C -- currentBid --> D[BidDisplay];
        C -- remainingTime --> E[CountdownTimer];
        C -- bidHistory --> F[BidHistory];
        C -- auctionStatus --> G[AuctionStatusIndicator];
    ```

## 4. State Management

The auction state will be managed as follows:

*   **Real-time State (from Supabase):**
    *   `currentBid`: The current highest bid.
    *   `remainingTime`: The time remaining in the auction.
    *   `bidHistory`: The list of all bids.
    *   `auctionStatus`: The current status of the auction.
*   **Local State (managed within `LiveAuctionInterface`):**
    *   `isAutoBidModalOpen`: A boolean to control the visibility of the auto-bid modal.
    *   `userBidStatus`: The user's current bidding status (e.g., "winning", "outbid").
    *   `isBiddingLocked`: A boolean to lock the bidding interface while a bid is being processed.

## 5. Animation Strategy

Framer Motion will be used to create a smooth and engaging user experience.

*   **`BidDisplay`:** When the `currentBid` changes, the new value will animate in, and the old value will animate out.
*   **`CountdownTimer`:** The circular progress bar will animate smoothly as the `remainingTime` decreases.
*   **`BidHistory`:** New bids will animate into the list as they are received.
*   **`QuickBidButtons`:** The buttons will have a subtle animation on hover and a more pronounced animation on click.

## 6. Security & User Experience

*   **Biometric Authentication:**
    *   A custom hook, `useBiometricAuth`, will be created to abstract the logic for biometric authentication.
    *   This hook will be called before placing a bid or setting an auto-bid.
    *   If biometric authentication is not available, the user will be prompted for their password.
*   **Client-Side Rate Limiting:**
    *   A custom hook, `useRateLimiter`, will be used to limit the number of bids a user can place in a given time period.
    *   This will be a simple time-based lock, preventing the user from spamming the bid button.
*   **Haptic & Audio Feedback:**
    *   The Vibration API will be used to provide haptic feedback when a bid is successfully placed.
    *   The Web Speech API will be used to provide audio notifications when the user is outbid.
*   **Server-Side Validation:**
    *   All bids will be validated on the server before being inserted into the database.
    *   The server will check that the bid amount is valid and that the user is allowed to bid.
*   **Fraud Detection:**
    *   Hooks will be added to the server-side bid validation logic to allow for future integration of fraud detection services.
*   **Session Management:**
    *   Secure, HTTP-only cookies will be used to manage user sessions.