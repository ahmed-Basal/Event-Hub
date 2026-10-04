import { useState, useRef, useCallback, useEffect } from 'react';
import { useController, type UseControllerProps, type FieldValues } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme';
import { locationIqApi } from '../../api';
import type { LocationIQResult, LocationIQAddress } from '../../types';

export type { LocationIQResult, LocationIQAddress };

export interface LocationInputProps<T extends FieldValues> extends UseControllerProps<T> {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  countrycodes?: string;
  acceptLanguage?: string;
  limit?: number;
  onSelectLocation?: (result: LocationIQResult) => void;
  sx?: SxProps<Theme>;
}

export default function LocationInput<T extends FieldValues>({
  label,
  placeholder = 'Search for a city or place...',
  disabled,
  countrycodes,
  acceptLanguage = 'ar,en',
  limit = 8,
  onSelectLocation,
  sx,
  ...controllerProps
}: LocationInputProps<T>) {
  const { field, fieldState } = useController({
    ...controllerProps,
    defaultValue: ('' as any),
  });

  const [inputValue, setInputValue] = useState<string>(
    typeof field.value === 'string' ? field.value : ''
  );
  const [options, setOptions] = useState<LocationIQResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof field.value === 'string' && field.value !== inputValue && !loading) {
      setInputValue(field.value);
    }
  }, [field.value]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, value: string) => {
      setInputValue(value);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (!value || value.trim().length < 3) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const results = await locationIqApi.autocomplete({
            query: value,
            limit,
            countrycodes,
            acceptLanguage,
            signal: controller.signal,
          });

          if (!controller.signal.aborted) {
            setOptions(results);
            setLoading(false);
          }
        } catch {
          if (!controller.signal.aborted) {
            setOptions([]);
            setLoading(false);
          }
        }
      }, 350);
    },
    [countrycodes, acceptLanguage, limit]
  );

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, selectedOption: LocationIQResult | string | null) => {
      if (!selectedOption) {
        field.onChange('');
        setInputValue('');
        setOptions([]);
        return;
      }
      if (typeof selectedOption === 'string') {
        field.onChange(selectedOption);
        setInputValue(selectedOption);
        return;
      }

      const storedValue =
        selectedOption.display_place ||
        selectedOption.address?.city ||
        selectedOption.address?.town ||
        selectedOption.address?.village ||
        selectedOption.address?.name ||
        selectedOption.display_name;

      field.onChange(storedValue);
      setInputValue(storedValue);

      if (typeof selectedOption !== 'string' && selectedOption) {
        onSelectLocation?.(selectedOption);
      }
    },
    [field, onSelectLocation]
  );

  const getOptionLabel = (option: LocationIQResult | string): string => {
    if (typeof option === 'string') return option;
    return option.display_name ?? '';
  };

  const isOptionEqualToValue = (option: LocationIQResult, value: LocationIQResult | string) => {
    if (typeof value === 'string') {
      return (
        option.display_place === value ||
        option.display_name === value ||
        option.address?.name === value ||
        option.address?.city === value
      );
    }
    return option.place_id === value.place_id;
  };

  return (
    <Autocomplete<LocationIQResult, false, false, true>
      freeSolo
      fullWidth
      disabled={disabled}
      options={options}
      loading={loading}
      inputValue={inputValue}
      filterOptions={(x) => x}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      onBlur={field.onBlur}
      loadingText={
        <Typography variant="body2" sx={{ color: tokens.textSecondary, px: 1 }}>
          Searching locations...
        </Typography>
      }
      noOptionsText={
        <Typography variant="body2" sx={{ color: tokens.textMuted, px: 1 }}>
          {inputValue.length < 3
            ? 'Type at least 3 characters to search'
            : 'No locations found'}
        </Typography>
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props as any;
        const mainTitle =
          option.display_place ||
          option.address?.name ||
          option.address?.city ||
          option.display_name;

        const secondaryAddress =
          option.display_address ||
          [
            option.address?.city || option.address?.town || option.address?.village,
            option.address?.state,
            option.address?.country,
          ]
            .filter(Boolean)
            .join(', ');

        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.2,
              px: 2,
              borderRadius: '10px',
              mx: 0.5,
              my: 0.3,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover, &.Mui-focused': {
                bgcolor: `${tokens.primary}18`,
                transform: 'translateX(2px)',
              },
            }}
          >
            <LocationOnIcon
              sx={{ color: tokens.primary, mt: 0.2, fontSize: '1.15rem', flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: tokens.textPrimary,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {mainTitle}
              </Typography>
              {secondaryAddress ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: tokens.textMuted,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    mt: 0.2,
                  }}
                >
                  {secondaryAddress}
                </Typography>
              ) : null}
            </Box>
          </Box>
        );
      }}
      slotProps={{
        popper: {
          sx: {
            '& .MuiPaper-root': {
              bgcolor: tokens.surface,
              backgroundImage: 'none',
              border: `1px solid ${tokens.border}`,
              borderRadius: '16px',
              boxShadow: tokens.shadowDropdown,
              mt: 1,
              backdropFilter: 'blur(16px)',
              '& .MuiAutocomplete-listbox': {
                p: 0.8,
                maxHeight: 300,
              },
              '& .MuiAutocomplete-option': {
                p: 0,
                '&[aria-selected="true"]': {
                  bgcolor: `${tokens.primary}25`,
                },
              },
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          slotProps={{
            inputLabel: params.slotProps.inputLabel,
            htmlInput: params.slotProps.htmlInput,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {loading && (
                    <CircularProgress
                      size={18}
                      sx={{ color: tokens.primary, mr: 1 }}
                    />
                  )}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: tokens.surface2,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '& fieldset': {
                borderColor: tokens.border,
              },
              '&:hover fieldset': {
                borderColor: tokens.borderHover,
              },
              '&.Mui-focused fieldset': {
                borderColor: tokens.primary,
                boxShadow: `0 0 0 3px ${tokens.primaryGlow}`,
              },
            },
            '& .MuiInputLabel-root': {
              color: tokens.textSecondary,
              '&.Mui-focused': {
                color: tokens.primary,
              },
            },
            '& .MuiAutocomplete-clearIndicator': {
              color: tokens.textMuted,
              '&:hover': { color: tokens.textSecondary },
            },
            ...sx,
          }}
        />
      )}
    />
  );
}
