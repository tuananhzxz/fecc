import React from 'react';
import { Box, Typography } from '@mui/material';
import { HomeCategoryType } from '../../../../types/HomeCategoryType';
import { useNavigate } from 'react-router-dom';

const OneCategoryCard = ({ category } : { category : HomeCategoryType}) => {
  const navigate = useNavigate();
  return (
    <Box
      onClick={() => navigate(`/products/${category.categoryId}`)}
      className="group cursor-pointer p-3 rounded-lg transition-all duration-300 hover:bg-gray-50"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        '&:hover': {
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Box
        className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2"
        sx={{
          transition: 'all 0.3s ease',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.03)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '.group:hover &': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:before': {
              opacity: 1,
            },
          }
        }}
      >
        <img
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
          src={category.image}
          alt={category.name}
          loading="lazy"
        />
      </Box>

      <Typography
        variant="subtitle2"
        className="text-center font-medium tracking-wide transition-colors duration-300 group-hover:text-primary-color"
        sx={{
          fontSize: '0.875rem',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {category.name}
      </Typography>
    </Box>
  );
};

export default OneCategoryCard;