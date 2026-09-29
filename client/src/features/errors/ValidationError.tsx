import { Alert, AlertTitle, List, ListItem, ListItemText } from "@mui/material";

interface Props {
  errors: string[];
}

export default function ValidationError({ errors }: Props) {
  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      <AlertTitle>Validation Errors</AlertTitle>
      <List dense disablePadding>
        {errors.map((err, i) => (
          <ListItem key={i} disableGutters>
            <ListItemText primary={err} />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}
