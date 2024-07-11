import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { MenuBar } from "../Menu/MenuBar";
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";

interface User {
  username: string;
  image: string;
}

export const Search = () => {
  const [search, setSearch] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  const handleSearchingUsernameChange = (text: string) => {
    const searchingUsername = text.toLowerCase();
    setSearch(searchingUsername);
  };

  const fetchSearchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/search/users`, {
        search,
      });
      setUsers(response.data.users);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setIsLoading(false);
    } finally {
    }
  }, [search]);

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  }

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 1000), [
    fetchSearchResults,
  ]);

  useEffect(() => {
    if (search.length !== 0) {
      debouncedSearch();
    } else {
      setUsers([]);
    }
  }, [search, debouncedSearch]);

  return (
    <>
      <MenuBar />
      <Box
        sx={{
          flexGrow: 1,
          padding: "16px",
          paddingBottom: 16,
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Box sx={{ maxWidth: 600, margin: "0 auto" }}>
          <TextField
            fullWidth
            variant="outlined"
            value={search}
            onChange={(e) => handleSearchingUsernameChange(e.target.value)}
            placeholder="Search users"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "white" }} />
                </InputAdornment>
              ),
              sx: {
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#262626",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#363636",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#474747",
                },
              },
            }}
            sx={{ mb: 2 }}
          />

          {users.length > 0 ? (
            <List sx={{ bgcolor: "#121212" }}>
              {users.map((user, index) => (
                <Box key={user.username}>
                  <ListItem
                    component={Link}
                    to={`/${user.username}`}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.image || "/user.png"}
                        alt={user.username}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" color="white">
                          {user.username}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < users.length - 1 && (
                    <Divider sx={{ bgcolor: "#262626" }} />
                  )}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              {isLoading ? (
                <CircularProgress sx={{ color: "rgb(50 50 50)" }} />
              ) : (
                <Typography variant="body2" color="#8e8e8e">
                  Search result not found
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
