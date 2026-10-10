import { type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import {
  MapComponent,
  type ActivityFormData,
  type LocationIQResult,
} from '../../../../shared';
import LocationInput from './LocationInput';
import { tokens } from '../../../../theme';

export interface ActivityLocationFieldProps {
  control: Control<ActivityFormData>;
  setValue: UseFormSetValue<ActivityFormData>;
  watch: UseFormWatch<ActivityFormData>;
  mapCoords: [number, number];
  setMapCoords: (coords: [number, number]) => void;
}

export default function ActivityLocationField({
  control,
  setValue,
  watch,
  mapCoords,
  setMapCoords,
}: ActivityLocationFieldProps) {
  const handleSelectCity = (loc: LocationIQResult) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      setMapCoords([lat, lon]);
      setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
      setValue('longitude', lon, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleSelectVenue = (loc: LocationIQResult) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      setMapCoords([lat, lon]);
      setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
      setValue('longitude', lon, { shouldValidate: true, shouldDirty: true });
    }
    const detectedCity = loc.address?.city || loc.address?.town || loc.address?.state || '';
    if (detectedCity && !watch('city')) {
      setValue('city', detectedCity, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleMapLocationSelect = (
    coords: [number, number],
    placeInfo?: { venue?: string; city?: string }
  ) => {
    setMapCoords(coords);
    setValue('latitude', coords[0], {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('longitude', coords[1], {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (placeInfo?.venue && !watch('venue')) {
      setValue('venue', placeInfo.venue, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (placeInfo?.city && !watch('city')) {
      setValue('city', placeInfo.city, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const currentVenue = watch('venue');
  const currentCity = watch('city');

  return (
    <>
      {/* City & Venue Inputs */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <LocationInput
          control={control}
          name="city"
          label="City"
          placeholder="Search for a city (e.g. Cairo, Alexandria)..."
          countrycodes="eg"
          onSelectLocation={handleSelectCity}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <LocationInput
          control={control}
          name="venue"
          label="Venue / Host Space"
          placeholder="Search venue or type name (e.g. Greek Campus, AUC)..."
          countrycodes="eg"
          onSelectLocation={handleSelectVenue}
        />
      </Grid>

      {/* Map Coordinates & Interactive Pin Preview */}
      <Grid size={{ xs: 12 }}>
        <Box sx={{ mt: 0.5, mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mb: 1,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: tokens.textSecondary,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                📍 Interactive Map &amp; Exact Coordinates (Saved to Database)
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.textMuted, fontSize: '0.72rem' }}>
                Click map, drag marker, or search places to set precise event latitude &amp; longitude.
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: tokens.primary,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: `${tokens.primary}15`,
                px: 1.2,
                py: 0.4,
                borderRadius: '6px',
                border: `1px solid ${tokens.border}`,
                fontFamily: 'monospace',
              }}
            >
              Lat: {mapCoords[0].toFixed(5)}, Lon: {mapCoords[1].toFixed(5)}
            </Typography>
          </Box>
          <MapComponent
            position={mapCoords}
            venue={currentVenue || 'Selected Venue'}
            city={currentCity || 'Egypt'}
            height={340}
            zoom={14}
            editable={true}
            showSearch={true}
            showTileSwitcher={true}
            tileTheme="voyager"
            onLocationSelect={handleMapLocationSelect}
          />
        </Box>
      </Grid>
    </>
  );
}
