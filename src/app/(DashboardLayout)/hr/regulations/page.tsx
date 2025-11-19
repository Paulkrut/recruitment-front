'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { apiFetch } from '@/utils/api';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface RegulationFolder {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  position: number;
  regulationsCount: number;
  childrenCount: number;
  createdAt: string;
}

interface Regulation {
  id: number;
  title: string;
  description: string | null;
  content?: string; // ← Добавили для полной загрузки при редактировании
  version: string;
  isActive: boolean;
  folderId: number | null;
  folderName: string | null;
  testsCount?: number; // ← Добавляем количество тестов
  createdBy: {
    id: number | null;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function RegulationsPage() {
  const { _ } = useLingui();

  const [folders, setFolders] = useState<RegulationFolder[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  
  // Dialogs
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [regulationDialogOpen, setRegulationDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<RegulationFolder | null>(null);
  const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);

  // Form data
  const [folderForm, setFolderForm] = useState({ name: '', description: '', parentId: null as number | null });
  const [regulationForm, setRegulationForm] = useState({
    title: '',
    description: '',
    content: '',
    version: '1.0',
    folderId: null as number | null,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [selectedFolderId, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем папки
      const foldersRes = await apiFetch(`${API_BASE}/api/regulations/folders`);
      const foldersData = await foldersRes.json();
      setFolders(foldersData);

      // Загружаем регламенты
      const params = new URLSearchParams();
      if (selectedFolderId) params.append('folderId', selectedFolderId.toString());
      if (search) params.append('search', search);

      const regulationsRes = await apiFetch(`${API_BASE}/api/regulations?${params.toString()}`);
      const regulationsData = await regulationsRes.json();
      setRegulations(regulationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulations/folders`, {
        method: 'POST',
        body: JSON.stringify(folderForm),
      });

      if (response.ok) {
        setFolderDialogOpen(false);
        setFolderForm({ name: '', description: '', parentId: null });
        loadData();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulations/folders/${editingFolder.id}`, {
        method: 'PATCH',
        body: JSON.stringify(folderForm),
      });

      if (response.ok) {
        setFolderDialogOpen(false);
        setEditingFolder(null);
        setFolderForm({ name: '', description: '', parentId: null });
        loadData();
      }
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!confirm('Удалить папку?')) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulations/folders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при удалении папки');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleCreateRegulation = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/regulations`, {
        method: 'POST',
        body: JSON.stringify(regulationForm),
      });

      if (response.ok) {
        setRegulationDialogOpen(false);
        setRegulationForm({
          title: '',
          description: '',
          content: '',
          version: '1.0',
          folderId: null,
          isActive: true,
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating regulation:', error);
    }
  };

  const handleUpdateRegulation = async () => {
    if (!editingRegulation) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulations/${editingRegulation.id}`, {
        method: 'PATCH',
        body: JSON.stringify(regulationForm),
      });

      if (response.ok) {
        setRegulationDialogOpen(false);
        setEditingRegulation(null);
        setRegulationForm({
          title: '',
          description: '',
          content: '',
          version: '1.0',
          folderId: null,
          isActive: true,
        });
        loadData();
      }
    } catch (error) {
      console.error('Error updating regulation:', error);
    }
  };

  const handleDeleteRegulation = async (id: number) => {
    if (!confirm('Удалить регламент?')) return;

    try {
      const response = await apiFetch(`${API_BASE}/api/regulations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при удалении регламента');
      }
    } catch (error) {
      console.error('Error deleting regulation:', error);
    }
  };

  const openFolderDialog = (folder: RegulationFolder | null = null) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderForm({
        name: folder.name,
        description: folder.description || '',
        parentId: folder.parentId,
      });
    } else {
      setEditingFolder(null);
      setFolderForm({ name: '', description: '', parentId: selectedFolderId });
    }
    setFolderDialogOpen(true);
  };

  const openRegulationDialog = async (regulation: Regulation | null = null) => {
    if (regulation) {
      setEditingRegulation(regulation);
      
      // Загружаем полные данные регламента с content
      try {
        const response = await apiFetch(`${API_BASE}/api/regulations/${regulation.id}`);
        if (response.ok) {
          const fullRegulation = await response.json();
          setRegulationForm({
            title: fullRegulation.title,
            description: fullRegulation.description || '',
            content: fullRegulation.content || '', // ← Теперь загружаем content!
            version: fullRegulation.version,
            folderId: fullRegulation.folderId,
            isActive: fullRegulation.isActive,
          });
        }
      } catch (error) {
        console.error('Error loading regulation:', error);
        // Fallback: используем данные из списка (без content)
        setRegulationForm({
          title: regulation.title,
          description: regulation.description || '',
          content: '',
          version: regulation.version,
          folderId: regulation.folderId,
          isActive: regulation.isActive,
        });
      }
    } else {
      setEditingRegulation(null);
      setRegulationForm({
        title: '',
        description: '',
        content: '',
        version: '1.0',
        folderId: selectedFolderId,
        isActive: true,
      });
    }
    setRegulationDialogOpen(true);
  };

  const getRootFolders = () => folders.filter(f => f.parentId === null);
  const getChildFolders = (parentId: number) => folders.filter(f => f.parentId === parentId);

  return (
    <PageContainer title={_(msg`Регламенты`)} description="Управление регламентами компании">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/hr" underline="hover" color="inherit">
          Главная
        </Link>
        <Typography color="text.primary">Регламенты</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">📚 Регламенты компании</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={() => openFolderDialog()}
          >
            Создать папку
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openRegulationDialog()}
          >
            Создать регламент
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder={_(msg`Поиск по регламентам...`)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Card>

      <Grid container spacing={3}>
        {/* Sidebar - Folders */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Папки
            </Typography>

            <Box
              onClick={() => setSelectedFolderId(null)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                borderRadius: 1,
                bgcolor: selectedFolderId === null ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon sx={{ mr: 1, color: selectedFolderId === null ? 'primary.main' : 'text.secondary' }} />
                <Typography fontWeight={selectedFolderId === null ? 600 : 400}>
                  Все регламенты
                </Typography>
              </Box>
            </Box>

            {getRootFolders().map(folder => (
              <Box key={folder.id} sx={{ mb: 0.5 }}>
                <Box
                  onClick={() => setSelectedFolderId(folder.id)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: selectedFolderId === folder.id ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <FolderIcon sx={{ mr: 1, color: selectedFolderId === folder.id ? 'primary.main' : 'text.secondary' }} />
                    <Typography fontWeight={selectedFolderId === folder.id ? 600 : 400}>
                      {folder.name}
                    </Typography>
                    <Chip
                      label={folder.regulationsCount}
                      size="small"
                      sx={{ ml: 1, height: 20 }}
                    />
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); openFolderDialog(folder); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>

        {/* Main Content - Regulations */}
        <Grid item xs={12} md={9}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Информация</TableCell>
                    <TableCell>Папка</TableCell>
                    <TableCell>Тесты</TableCell>
                    <TableCell>Обновлён</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regulations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">
                          {loading ? 'Загрузка...' : 'Регламенты не найдены'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    regulations.map((regulation) => (
                      <TableRow key={regulation.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="subtitle2">{regulation.title}</Typography>
                              {regulation.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {regulation.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              <Chip label={`v${regulation.version}`} size="small" color="default" />
                              <Chip
                                label={regulation.isActive ? 'Активен' : 'Неактивен'}
                                size="small"
                                color={regulation.isActive ? 'success' : 'default'}
                              />
                            </Box>
                            {regulation.createdBy.name && (
                              <Typography variant="caption" color="text.secondary">
                                {regulation.createdBy.name}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {regulation.folderId && regulation.folderName ? (
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => setSelectedFolderId(regulation.folderId)}
                              sx={{ 
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {regulation.folderName}
                            </Link>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {regulation.testsCount !== undefined && regulation.testsCount > 0 ? (
                            <NextLink href={`/hr/regulation-tests?regulationId=${regulation.id}`} passHref legacyBehavior>
                              <Link underline="hover" sx={{ cursor: 'pointer' }}>
                                <Chip 
                                  label={regulation.testsCount} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ cursor: 'pointer' }}
                                />
                              </Link>
                            </NextLink>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>{new Date(regulation.updatedAt).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell align="right">
                          <Tooltip title={_(msg`Создать тест`)}>
                            <IconButton 
                              size="small" 
                              component={NextLink}
                              href={`/hr/regulation-tests/create?regulationId=${regulation.id}`}
                            >
                              <AssignmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={_(msg`Редактировать`)}>
                            <IconButton size="small" onClick={() => openRegulationDialog(regulation)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={_(msg`Удалить`)}>
                            <IconButton size="small" onClick={() => handleDeleteRegulation(regulation.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Folder Dialog */}
      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFolder ? 'Редактировать папку' : 'Создать папку'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={_(msg`Название папки`)}
              fullWidth
              value={folderForm.name}
              onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
            />
            <TextField
              label={_(msg`Описание`)}
              fullWidth
              multiline
              rows={3}
              value={folderForm.description}
              onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
          >
            {editingFolder ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regulation Dialog */}
      <Dialog open={regulationDialogOpen} onClose={() => setRegulationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRegulation ? 'Редактировать регламент' : 'Создать регламент'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={_(msg`Название регламента`)}
              fullWidth
              value={regulationForm.title}
              onChange={(e) => setRegulationForm({ ...regulationForm, title: e.target.value })}
            />
            <TextField
              label={_(msg`Описание`)}
              fullWidth
              multiline
              rows={2}
              value={regulationForm.description}
              onChange={(e) => setRegulationForm({ ...regulationForm, description: e.target.value })}
            />
            <TextField
              label={_(msg`Содержание регламента`)}
              fullWidth
              multiline
              rows={10}
              value={regulationForm.content}
              onChange={(e) => setRegulationForm({ ...regulationForm, content: e.target.value })}
              placeholder={_(msg`Введите полный текст регламента...`)}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label={_(msg`Версия`)}
                  fullWidth
                  value={regulationForm.version}
                  onChange={(e) => setRegulationForm({ ...regulationForm, version: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Папка</InputLabel>
                  <Select
                    value={regulationForm.folderId || ''}
                    label={_(msg`Папка`)}
                    onChange={(e) => setRegulationForm({ ...regulationForm, folderId: e.target.value as number || null })}
                  >
                    <MenuItem value="">Без папки</MenuItem>
                    {folders.map(folder => (
                      <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegulationDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={editingRegulation ? handleUpdateRegulation : handleCreateRegulation}
          >
            {editingRegulation ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

