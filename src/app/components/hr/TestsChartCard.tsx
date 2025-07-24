"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { IconRefresh, IconTrendingUp } from "@tabler/icons-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface TestData {
  date: string;
  count: number;
}

interface TestsChartCardProps {
  data: TestData[];
}

export default function TestsChartCard({ data }: TestsChartCardProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Тестов",
        data: data.map((d) => d.count),
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#2196f3",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#2196f3",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => `Дата: ${context[0].label}`,
          label: (context: any) => `Тестов: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
          beginAtZero: true,
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: "#2196f3",
      },
    },
  };

  const totalTests = data.reduce((sum, item) => sum + item.count, 0);
  const avgTests = data.length > 0 ? Math.round(totalTests / data.length) : 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconTrendingUp size={24} color="#2196f3" />
            <Typography variant="h5" fontWeight="600">
              Тестов за 7 дней
            </Typography>
          </Box>
          <Tooltip title="Обновить данные">
            <IconButton size="small" color="primary">
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="700" color="primary">
              {totalTests}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Всего тестов
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="700" color="success.main">
              {avgTests}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              В среднем в день
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 250, position: "relative" }}>
          <Line data={chartData} options={options} />
        </Box>

        {data.length === 0 && (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="textSecondary">
              Нет данных для отображения
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 