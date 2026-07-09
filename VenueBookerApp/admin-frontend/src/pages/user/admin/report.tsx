import React, { useEffect, useState } from 'react';

import type { PopularVenueReport , ApplicantReport } from "@admin-shared/types";
import { ReportFetcherServices } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import AdminReportsPage from '@/component/AdminReportCard';
import { Center, Spinner } from '@chakra-ui/react';

export default function Report() {

    const [popularVenuesReport,setPopularVenuesReport] = useState<PopularVenueReport[]>([]);
    const [mostActiveApplicantsReport,setMostActiveApplicantsReport] = useState<ApplicantReport[]>([]);
    const [isLoading,setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const {user} = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!router.isReady) return;

      if(!user)
      {
        router.replace("/auth/sign-in");
        return;
      }

      if(user.role !== "admin")
      {
        router.replace("/404");
        return;
      }

      const fetchReports = async () => {
        setError('');
        setIsLoading(true);

        try {
          const [popularVenues, activeApplicants] = await Promise.all([
            ReportFetcherServices.getThreeMostPopularVenuesAndTimings(),
            ReportFetcherServices.getThreeMostPopularApplicantsAndTheirSuccessRate(),
          ]);

          setPopularVenuesReport(popularVenues);
          setMostActiveApplicantsReport(activeApplicants);
        } catch (err) {
          console.error('Failed to load reports', err);
          setError('Failed to load reports. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchReports();
    },[router, user]);

  if (isLoading || !router.isReady) {
    return <Center><Spinner /></Center>;
  }

  if (error) {
    return <Center color="red.500">{error}</Center>;
  }

  return (
    <div>
      <AdminReportsPage
        popularVenues={popularVenuesReport}
        activeApplicants={mostActiveApplicantsReport}
      />
    </div>
  )
}
