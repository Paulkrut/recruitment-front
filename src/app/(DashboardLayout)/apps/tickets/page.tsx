"use client"

import PageContainer from '@/app/components/container/PageContainer';
import TicketListing from '@/app/components/apps/tickets/TicketListing';
import TicketFilter from '@/app/components/apps/tickets/TicketFilter';
import ChildCard from '@/app/components/shared/ChildCard';


const TicketList = () => {
  return (
    <PageContainer title="Ticket App" description="this is Ticket App">
      <ChildCard>
        <TicketFilter />
        <TicketListing />
      </ChildCard>
    </PageContainer>
  );
};

export default TicketList;
