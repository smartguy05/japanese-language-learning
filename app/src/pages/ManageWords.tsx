import { useState, useMemo } from 'react';
import { useWords } from '../contexts/WordContext';
import { Word } from '../types/word';
import { Card, Button, Input, Modal } from '../components/common';
import { WordForm } from '../components/manage/WordForm';
import { WordListItem } from '../components/manage/WordListItem';

type FilterType = 'all' | 'words' | 'sentences' | 'mastered' | 'needsReview';

export function ManageWords() {
  const { words, addWord, updateWord, deleteWord } = useWords();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [deletingWord, setDeletingWord] = useState<Word | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and search words
  const filteredWords = useMemo(() => {
    let filtered = words;

    // Apply filter type
    if (filterType === 'words') {
      filtered = filtered.filter(w => w.type === 'word');
    } else if (filterType === 'sentences') {
      filtered = filtered.filter(w => w.type === 'sentence');
    } else if (filterType === 'mastered') {
      filtered = filtered.filter(w => w.mastered);
    } else if (filterType === 'needsReview') {
      filtered = filtered.filter(w => w.needsReview);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.japanese.toLowerCase().includes(query) ||
        w.romanji.toLowerCase().includes(query) ||
        w.english.toLowerCase().includes(query)
      );
    }

    // Sort by day, then by creation date
    return filtered.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [words, filterType, searchQuery]);

  // Group by day
  const groupedWords = useMemo(() => {
    const groups: Record<number, Word[]> = {};
    filteredWords.forEach(word => {
      if (!groups[word.day]) {
        groups[word.day] = [];
      }
      groups[word.day].push(word);
    });
    return groups;
  }, [filteredWords]);

  const handleAddWord = (wordData: Omit<Word, 'id' | 'createdAt'>) => {
    addWord(wordData);
    setShowAddForm(false);
  };

  const handleEditWord = (wordData: Omit<Word, 'id' | 'createdAt'>) => {
    if (editingWord) {
      updateWord(editingWord.id, wordData);
      setEditingWord(null);
    }
  };

  const handleDeleteWord = () => {
    if (deletingWord) {
      deleteWord(deletingWord.id);
      setDeletingWord(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-text-primary">Manage Words & Sentences</h1>
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            + Add New
          </Button>
        </div>

        {/* Search and filters */}
        <div className="space-y-4">
          <Input
            placeholder="Search by Japanese, romanji, or English..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('all')}
              size="small"
            >
              All ({words.length})
            </Button>
            <Button
              variant={filterType === 'words' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('words')}
              size="small"
            >
              Words ({words.filter(w => w.type === 'word').length})
            </Button>
            <Button
              variant={filterType === 'sentences' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('sentences')}
              size="small"
            >
              Sentences ({words.filter(w => w.type === 'sentence').length})
            </Button>
            <Button
              variant={filterType === 'mastered' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('mastered')}
              size="small"
            >
              Mastered ({words.filter(w => w.mastered).length})
            </Button>
            <Button
              variant={filterType === 'needsReview' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('needsReview')}
              size="small"
            >
              Needs Review ({words.filter(w => w.needsReview).length})
            </Button>
          </div>
        </div>
      </div>

      {/* Word list */}
      {filteredWords.length === 0 ? (
        <Card variant="default" padding="large">
          <p className="text-text-secondary text-center">
            {searchQuery
              ? `No items found matching "${searchQuery}"`
              : filterType === 'all'
              ? 'No words or sentences yet. Click "Add New" to get started!'
              : `No ${filterType} items found.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedWords)
            .map(Number)
            .sort((a, b) => a - b)
            .map(day => (
              <div key={day}>
                <h2 className="text-lg font-semibold text-text-primary mb-3 sticky top-0 bg-bg-primary dark:bg-bg-primary-dark py-2 z-10">
                  Day {day} ({groupedWords[day].length} item{groupedWords[day].length !== 1 ? 's' : ''})
                </h2>
                <div className="space-y-3">
                  {groupedWords[day].map(word => (
                    <WordListItem
                      key={word.id}
                      word={word}
                      onEdit={setEditingWord}
                      onDelete={setDeletingWord}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add form modal */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <WordForm
          onSubmit={handleAddWord}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Edit form modal */}
      <Modal isOpen={!!editingWord} onClose={() => setEditingWord(null)}>
        {editingWord && (
          <WordForm
            word={editingWord}
            onSubmit={handleEditWord}
            onCancel={() => setEditingWord(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deletingWord} onClose={() => setDeletingWord(null)}>
        {deletingWord && (
          <Card variant="default" padding="large">
            <h2 className="text-xl font-bold text-text-primary mb-4">Delete Confirmation</h2>
            <p className="text-text-secondary mb-4">
              Are you sure you want to delete this {deletingWord.type}?
            </p>
            <div className="p-4 bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-lg mb-6">
              <p className="text-2xl font-japanese text-text-primary mb-2">
                {deletingWord.japanese}
              </p>
              <p className="text-sm text-text-secondary">{deletingWord.english}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeletingWord(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteWord}
                variant="primary"
                className="flex-1 bg-error hover:bg-error"
              >
                Delete
              </Button>
            </div>
          </Card>
        )}
      </Modal>
    </div>
  );
}
