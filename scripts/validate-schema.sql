-- MotoAuto.ch Database Schema Validation Script
-- This script validates that all required tables, relationships, and constraints are properly set up

-- Check if all required tables exist
SELECT 
    'Table Validation' as check_type,
    table_name,
    CASE 
        WHEN table_name IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments') 
        THEN 'REQUIRED - ' || CASE WHEN table_type = 'BASE TABLE' THEN 'EXISTS' ELSE 'MISSING' END
        ELSE 'OPTIONAL - EXISTS'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')
ORDER BY table_name;

-- Check foreign key relationships
SELECT 
    'Foreign Key Validation' as check_type,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    'EXISTS' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')
ORDER BY tc.table_name, tc.constraint_name;

-- Check indexes
SELECT 
    'Index Validation' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef,
    'EXISTS' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    'RLS Policy Validation' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    'EXISTS' as status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')
ORDER BY tablename, policyname;

-- Check table constraints
SELECT 
    'Constraint Validation' as check_type,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause,
    'EXISTS' as status
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')
    AND tc.constraint_type IN ('CHECK', 'UNIQUE', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- Check triggers
SELECT 
    'Trigger Validation' as check_type,
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    'EXISTS' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND event_object_table IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')
ORDER BY event_object_table, trigger_name;

-- Check functions
SELECT 
    'Function Validation' as check_type,
    routine_schema,
    routine_name,
    routine_type,
    data_type,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'update_updated_at_column',
        'update_listing_bid_stats', 
        'check_auction_extension',
        'calculate_commission'
    )
ORDER BY routine_name;

-- Summary report
SELECT 
    'SUMMARY' as check_type,
    'Required Tables' as category,
    COUNT(*) as total_count,
    'Should be 7' as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'Foreign Keys' as category,
    COUNT(*) as total_count,
    'Should be 8+' as expected
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
    AND constraint_type = 'FOREIGN KEY'
    AND table_name IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'Indexes' as category,
    COUNT(*) as total_count,
    'Should be 25+' as expected
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'RLS Policies' as category,
    COUNT(*) as total_count,
    'Should be 10+' as expected
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'packages', 'profiles', 'listings', 'auctions', 'bids', 'payments')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'Functions' as category,
    COUNT(*) as total_count,
    'Should be 4' as expected
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'update_updated_at_column',
        'update_listing_bid_stats', 
        'check_auction_extension',
        'calculate_commission'
    );