import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTabs, type Tab } from '@/hooks/use-tabs';

describe('useTabs', () => {
  const mockTabs: Tab[] = [
    { id: 'tab1', label: 'Tab 1', children: <div>Content 1</div> },
    { id: 'tab2', label: 'Tab 2', children: <div>Content 2</div> },
    { id: 'tab3', label: 'Tab 3', children: <div>Content 3</div> },
  ];

  it('should initialize with the first tab when initialTabId is not found', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'nonexistent',
      })
    );

    expect(result.current.selectedTab).toBe(mockTabs[0]);
    expect(result.current.tabProps.selectedTabIndex).toBe(0);
    expect(result.current.contentProps.selectedTabIndex).toBe(0);
    expect(result.current.contentProps.direction).toBe(0);
  });

  it('should initialize with the correct tab when initialTabId exists', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab2',
      })
    );

    expect(result.current.selectedTab).toBe(mockTabs[1]);
    expect(result.current.tabProps.selectedTabIndex).toBe(1);
    expect(result.current.contentProps.selectedTabIndex).toBe(1);
    expect(result.current.contentProps.direction).toBe(0);
  });

  it('should initialize with the last tab when initialTabId is the last tab', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab3',
      })
    );

    expect(result.current.selectedTab).toBe(mockTabs[2]);
    expect(result.current.tabProps.selectedTabIndex).toBe(2);
    expect(result.current.contentProps.selectedTabIndex).toBe(2);
  });

  it('should pass tabs to tabProps', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
      })
    );

    expect(result.current.tabProps.tabs).toBe(mockTabs);
    expect(result.current.tabProps.tabs).toHaveLength(3);
  });

  it('should pass onChange function to tabProps', () => {
    const mockOnChange = vi.fn();
    
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
        onChange: mockOnChange,
      })
    );

    expect(result.current.tabProps.onChange).toBe(mockOnChange);
  });

  it('should not pass onChange when not provided', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
      })
    );

    expect(result.current.tabProps.onChange).toBeUndefined();
  });

  it('should provide setSelectedTab function in tabProps', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
      })
    );

    expect(result.current.tabProps.setSelectedTab).toBeInstanceOf(Function);
  });

  it('should update selected tab when setSelectedTab is called', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
      })
    );

    expect(result.current.selectedTab).toBe(mockTabs[0]);

    act(() => {
      result.current.tabProps.setSelectedTab([2, 1]); // [index, direction]
    });

    expect(result.current.selectedTab).toBe(mockTabs[2]);
    expect(result.current.tabProps.selectedTabIndex).toBe(2);
    expect(result.current.contentProps.selectedTabIndex).toBe(2);
    expect(result.current.contentProps.direction).toBe(1);
  });

  it('should handle direction changes correctly', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab2',
      })
    );

    // Initially at tab 2 (index 1)
    expect(result.current.contentProps.direction).toBe(0);

    // Move to tab 1 (index 0) - backward direction
    act(() => {
      result.current.tabProps.setSelectedTab([0, -1]);
    });

    expect(result.current.contentProps.direction).toBe(-1);
    expect(result.current.selectedTab).toBe(mockTabs[0]);

    // Move to tab 3 (index 2) - forward direction
    act(() => {
      result.current.tabProps.setSelectedTab([2, 1]);
    });

    expect(result.current.contentProps.direction).toBe(1);
    expect(result.current.selectedTab).toBe(mockTabs[2]);
  });

  it('should handle empty tabs array gracefully', () => {
    const { result } = renderHook(() =>
      useTabs({
        tabs: [],
        initialTabId: 'any',
      })
    );

    expect(result.current.tabProps.selectedTabIndex).toBe(0);
    expect(result.current.selectedTab).toBeUndefined();
    expect(result.current.tabProps.tabs).toEqual([]);
  });

  it('should handle single tab correctly', () => {
    const singleTab: Tab[] = [
      { id: 'single', label: 'Single Tab', children: <div>Single Content</div> },
    ];

    const { result } = renderHook(() =>
      useTabs({
        tabs: singleTab,
        initialTabId: 'single',
      })
    );

    expect(result.current.selectedTab).toBe(singleTab[0]);
    expect(result.current.tabProps.selectedTabIndex).toBe(0);
    expect(result.current.contentProps.selectedTabIndex).toBe(0);
  });

  it('should maintain state consistency across multiple updates', () => {
    const mockOnChange = vi.fn();
    
    const { result } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
        onChange: mockOnChange,
      })
    );

    // Initial state
    expect(result.current.selectedTab?.id).toBe('tab1');

    // First update
    act(() => {
      result.current.tabProps.setSelectedTab([1, 1]);
    });

    expect(result.current.selectedTab?.id).toBe('tab2');
    expect(result.current.tabProps.selectedTabIndex).toBe(1);
    expect(result.current.contentProps.direction).toBe(1);

    // Second update
    act(() => {
      result.current.tabProps.setSelectedTab([2, 1]);
    });

    expect(result.current.selectedTab?.id).toBe('tab3');
    expect(result.current.tabProps.selectedTabIndex).toBe(2);
    expect(result.current.contentProps.direction).toBe(1);

    // Third update - back to first
    act(() => {
      result.current.tabProps.setSelectedTab([0, -1]);
    });

    expect(result.current.selectedTab?.id).toBe('tab1');
    expect(result.current.tabProps.selectedTabIndex).toBe(0);
    expect(result.current.contentProps.direction).toBe(-1);
  });

  it('should handle tabs with complex children correctly', () => {
    const complexTabs: Tab[] = [
      {
        id: 'complex1',
        label: 'Complex Tab 1',
        children: (
          <div>
            <h1>Title</h1>
            <p>Content</p>
          </div>
        ),
      },
      {
        id: 'complex2',
        label: 'Complex Tab 2',
        children: <span>Simple span</span>,
      },
    ];

    const { result } = renderHook(() =>
      useTabs({
        tabs: complexTabs,
        initialTabId: 'complex2',
      })
    );

    expect(result.current.selectedTab).toBe(complexTabs[1]);
    expect(result.current.selectedTab?.children).toBe(complexTabs[1]?.children);
  });

  it('should return consistent object references for stable props', () => {
    const { result, rerender } = renderHook(() =>
      useTabs({
        tabs: mockTabs,
        initialTabId: 'tab1',
      })
    );

    const firstTabProps = result.current.tabProps;
    const firstSelectedTab = result.current.selectedTab;

    // Rerender without changing props
    rerender();

    // References should remain the same for unchanged state
    expect(result.current.tabProps.tabs).toBe(firstTabProps.tabs);
    expect(result.current.tabProps.selectedTabIndex).toBe(firstTabProps.selectedTabIndex);
    expect(result.current.selectedTab).toBe(firstSelectedTab);
  });

  it('should work with tabs that have duplicate labels but unique ids', () => {
    const duplicateLabelTabs: Tab[] = [
      { id: 'tab1', label: 'Same Label', children: <div>Content 1</div> },
      { id: 'tab2', label: 'Same Label', children: <div>Content 2</div> },
      { id: 'tab3', label: 'Same Label', children: <div>Content 3</div> },
    ];

    const { result } = renderHook(() =>
      useTabs({
        tabs: duplicateLabelTabs,
        initialTabId: 'tab2',
      })
    );

    expect(result.current.selectedTab?.id).toBe('tab2');
    expect(result.current.selectedTab?.label).toBe('Same Label');
    expect(result.current.tabProps.selectedTabIndex).toBe(1);
  });
});