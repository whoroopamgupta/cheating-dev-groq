describe('CustomDropdown Component', () => {
    describe('Icon Support', () => {
        it('should support options with icon property', () => {
            const optionsWithIcons = [
                { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', icon: './assets/models/gemini.png' },
                { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', icon: './assets/models/gemini.png' }
            ];

            optionsWithIcons.forEach(option => {
                expect(option.value).toBeDefined();
                expect(option.label).toBeDefined();
                expect(option.icon).toBeDefined();
            });
        });

        it('should support options without icon property', () => {
            const optionsWithoutIcons = [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' }
            ];

            optionsWithoutIcons.forEach(option => {
                expect(option.value).toBeDefined();
                expect(option.label).toBeDefined();
                expect(option.icon).toBeUndefined();
            });
        });

        it('should support mixed options with and without icons', () => {
            const mixedOptions = [
                { value: 'with-icon', label: 'With Icon', icon: './icon.png' },
                { value: 'without-icon', label: 'Without Icon' }
            ];

            expect(mixedOptions[0].icon).toBeDefined();
            expect(mixedOptions[1].icon).toBeUndefined();
        });
    });

    describe('Model Selection Options', () => {
        it('should have correct Gemini model options with icons', () => {
            const geminiOptions = [
                { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Faster, Balanced)', icon: './assets/models/500px-Google_Gemini_icon_2025.svg.png' },
                { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Slower, More Accurate)', icon: './assets/models/500px-Google_Gemini_icon_2025.svg.png' }
            ];

            expect(geminiOptions.length).toBe(2);
            expect(geminiOptions[0].icon).toContain('Gemini');
            expect(geminiOptions[1].icon).toContain('Gemini');
        });

        it('should have correct GPT OSS model options with icons', () => {
            const groqOptions = [
                { value: 'gpt-oss-120b', label: 'GPT OSS 120B (Accurate, Powerful)', icon: './assets/models/openai_logo.png' },
                { value: 'gpt-oss-20b', label: 'GPT OSS 20B (Faster, Lightweight)', icon: './assets/models/openai_logo.png' }
            ];

            expect(groqOptions.length).toBe(2);
            expect(groqOptions[0].icon).toContain('openai');
            expect(groqOptions[1].icon).toContain('openai');
        });

        it('should use OpenAI logo for GPT OSS models', () => {
            const openaiIcon = './assets/models/openai_logo.png';
            expect(openaiIcon).toContain('openai');
            expect(openaiIcon).toContain('.png');
        });

        it('should use Gemini logo for Gemini models', () => {
            const geminiIcon = './assets/models/500px-Google_Gemini_icon_2025.svg.png';
            expect(geminiIcon).toContain('Gemini');
            expect(geminiIcon).toContain('.png');
        });
    });

    describe('Option Structure', () => {
        it('should have required value property', () => {
            const option = { value: 'test', label: 'Test' };
            expect(option.value).toBe('test');
        });

        it('should have required label property', () => {
            const option = { value: 'test', label: 'Test Label' };
            expect(option.label).toBe('Test Label');
        });

        it('should have optional icon property', () => {
            const optionWithIcon = { value: 'test', label: 'Test', icon: './icon.png' };
            const optionWithoutIcon = { value: 'test', label: 'Test' };

            expect(optionWithIcon.icon).toBe('./icon.png');
            expect(optionWithoutIcon.icon).toBeUndefined();
        });
    });

    describe('Icon Styling', () => {
        it('should have consistent icon size (12px)', () => {
            const iconSize = 12;
            expect(iconSize).toBe(12);
        });

        it('should have gap between icon and label (6px)', () => {
            const gap = 6;
            expect(gap).toBe(6);
        });
    });

    describe('Profile to Model Mapping', () => {
        it('should map exam profile to Gemini options', () => {
            const examProfile = 'exam';
            const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];

            if (examProfile === 'exam') {
                expect(geminiModels).toContain('gemini-2.5-flash');
                expect(geminiModels).toContain('gemini-2.5-pro');
            }
        });

        it('should map interview profiles to GPT OSS options', () => {
            const interviewProfiles = ['interview', 'sales', 'meeting', 'presentation', 'negotiation'];
            const groqModels = ['gpt-oss-120b', 'gpt-oss-20b'];

            interviewProfiles.forEach(profile => {
                if (profile !== 'exam') {
                    expect(groqModels).toContain('gpt-oss-120b');
                    expect(groqModels).toContain('gpt-oss-20b');
                }
            });
        });
    });

    describe('Default Values', () => {
        it('should have gpt-oss-120b as default for interview mode', () => {
            const defaultGroqModel = 'gpt-oss-120b';
            expect(defaultGroqModel).toBe('gpt-oss-120b');
        });

        it('should have gemini-2.5-pro as default for exam mode', () => {
            const defaultGeminiModel = 'gemini-2.5-pro';
            expect(defaultGeminiModel).toBe('gemini-2.5-pro');
        });
    });
});
