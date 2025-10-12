// src/api/features/org/hooks/useOrgLabels.ts
import { useMemo } from "react";
import { useNationalList, useDistrictsByNational, useChurchesByDistrict } from "./useOrg";

export function useOrgLabels(nationalChurchId?: string, districtId?: string) {
  const { data: nationals = [] } = useNationalList();
  const { data: districts = [] } = useDistrictsByNational(nationalChurchId);
  const { data: churches = [] } = useChurchesByDistrict(districtId);

  const nationalMap = useMemo(
    () => new Map(nationals.map((n) => [n._id, n.name])),
    [nationals]
  );
  const districtMap = useMemo(
    () => new Map(districts.map((d) => [d._id, d.name])),
    [districts]
  );
  const churchMap = useMemo(
    () => new Map(churches.map((c) => [c._id, c.name])),
    [churches]
  );

  return { nationalMap, districtMap, churchMap };
}
